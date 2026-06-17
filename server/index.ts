import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import express from "express";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const PORT = Number(process.env.RENDER_PORT ?? 3001);
const COMPOSITION_ID = "Scatter";

type RenderRequestBody = {
  sequence: unknown;
  format: { width: number; height: number };
  fps: number;
  durationInFrames: number;
  customBrands?: unknown[];
  fileName?: string;
};

const app = express();
app.use(express.json({ limit: "50mb" }));

let bundlePromise: Promise<string> | null = null;

function getProjectRoot(): string {
  return fileURLToPath(new URL("..", import.meta.url));
}

async function getBundleLocation(): Promise<string> {
  if (!bundlePromise) {
    const root = getProjectRoot();
    bundlePromise = bundle({
      entryPoint: join(root, "src/remotion/index.ts"),
      webpackOverride: (config) => {
        config.resolve ??= {};
        config.resolve.alias = {
          ...config.resolve.alias,
          "@": join(root, "src"),
        };
        return config;
      },
    });
  }

  return bundlePromise;
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/render", async (req, res) => {
  const body = req.body as RenderRequestBody;
  const { sequence, format, fps, durationInFrames, customBrands, fileName } = body;

  if (!sequence || !format?.width || !format?.height || !fps || !durationInFrames) {
    res.status(400).send("Missing required render fields.");
    return;
  }

  const inputProps = {
    sequence,
    customBrands: customBrands ?? [],
  };

  let outputPath: string | null = null;

  try {
    const serveUrl = await getBundleLocation();

    const composition = await selectComposition({
      serveUrl,
      id: COMPOSITION_ID,
      inputProps,
    });

    const outputDir = mkdtempSync(join(tmpdir(), "scatter-render-"));
    outputPath = join(outputDir, "output.mp4");

    await renderMedia({
      serveUrl,
      composition: {
        ...composition,
        width: format.width,
        height: format.height,
        fps,
        durationInFrames,
      },
      codec: "h264",
      outputLocation: outputPath,
      inputProps,
    });

    const fileBuffer = readFileSync(outputPath);
    const safeName = (fileName || "export").replace(/[^a-z0-9-_]+/gi, "-").toLowerCase();

    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Content-Disposition", `attachment; filename="${safeName}.mp4"`);
    res.send(fileBuffer);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Render failed.";
    console.error("[render]", error);
    res.status(500).send(message);
  } finally {
    if (outputPath) {
      rmSync(join(outputPath, ".."), { recursive: true, force: true });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Scatter render API listening on http://localhost:${PORT}`);
});
