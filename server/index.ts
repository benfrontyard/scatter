import { bundle } from "@remotion/bundler";
import { makeCancelSignal, renderMedia, selectComposition } from "@remotion/renderer";
import express from "express";
import { mkdtempSync, readFileSync, rmSync, watch } from "node:fs";
import { availableParallelism } from "node:os";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const PORT = Number(process.env.RENDER_PORT ?? 3001);
const COMPOSITION_ID = "Scatter";
const JOB_TTL_MS = 15 * 60 * 1000;

type RenderRequestBody = {
  sequence: unknown;
  format: { width: number; height: number };
  fps: number;
  durationInFrames: number;
  customBrands?: unknown[];
  fileName?: string;
};

type RenderJobStatus =
  | "queued"
  | "rendering"
  | "encoding"
  | "uploading"
  | "complete"
  | "failed"
  | "cancelled";

type ServerRenderJob = {
  id: string;
  status: RenderJobStatus;
  progress: number;
  message?: string;
  error?: string;
  outputPath?: string;
  fileName?: string;
  cancel: () => void;
  startedAt: number;
  completedAt?: number;
};

const app = express();
app.use(express.json({ limit: "50mb" }));

let bundlePromise: Promise<string> | null = null;
const renderJobs = new Map<string, ServerRenderJob>();

function invalidateBundleCache(reason: string) {
  if (!bundlePromise) return;
  bundlePromise = null;
  console.log(`[render] Bundle cache cleared (${reason})`);
}

function watchSourceForBundleInvalidation(root: string) {
  if (process.env.NODE_ENV === "production") return;

  const watchRoots = [
    join(root, "src/remotion"),
    join(root, "src/config"),
  ];

  for (const watchRoot of watchRoots) {
    watch(watchRoot, { recursive: true }, (_event, filename) => {
      if (filename) {
        invalidateBundleCache(filename);
      }
    });
  }
}

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

function isCancelledRenderError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return error.message.includes("got cancelled");
}

function getRenderConcurrency(): number {
  const cores = availableParallelism();
  return Math.max(1, Math.floor(cores * 0.75));
}

function scheduleJobCleanup(jobId: string) {
  setTimeout(() => {
    const job = renderJobs.get(jobId);
    if (!job) return;
    if (job.outputPath) {
      rmSync(join(job.outputPath, ".."), { recursive: true, force: true });
    }
    renderJobs.delete(jobId);
  }, JOB_TTL_MS);
}

function updateJob(
  jobId: string,
  patch: Partial<Pick<ServerRenderJob, "status" | "progress" | "message" | "error" | "outputPath" | "completedAt">>,
) {
  const job = renderJobs.get(jobId);
  if (!job) return;
  Object.assign(job, patch);
}

async function runRenderJob(jobId: string, body: RenderRequestBody) {
  const { sequence, format, fps, durationInFrames, customBrands, fileName } = body;
  const { cancelSignal, cancel } = makeCancelSignal();

  renderJobs.set(jobId, {
    id: jobId,
    status: "queued",
    progress: 0,
    message: "Queued for rendering…",
    fileName,
    cancel,
    startedAt: Date.now(),
  });

  const inputProps = {
    sequence,
    customBrands: customBrands ?? [],
  };

  let outputPath: string | null = null;

  try {
    updateJob(jobId, { status: "rendering", progress: 5, message: "Preparing composition…" });

    const serveUrl = await getBundleLocation();

    const composition = await selectComposition({
      serveUrl,
      id: COMPOSITION_ID,
      inputProps,
    });

    const outputDir = mkdtempSync(join(tmpdir(), "scatter-render-"));
    outputPath = join(outputDir, "output.mp4");
    updateJob(jobId, { outputPath, progress: 10, message: "Rendering frames…" });

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
      cancelSignal,
      concurrency: getRenderConcurrency(),
      onProgress: ({ progress, renderedFrames, stitchStage }) => {
        const pct = Math.round(progress * 100);
        const message =
          stitchStage === "encoding"
            ? `Encoding video… (${renderedFrames}/${durationInFrames} frames)`
            : `Rendering frames… (${renderedFrames}/${durationInFrames})`;
        updateJob(jobId, {
          status: stitchStage === "encoding" ? "encoding" : "rendering",
          progress: Math.max(10, Math.min(95, pct)),
          message,
        });
      },
    });

    updateJob(jobId, {
      status: "complete",
      progress: 100,
      message: "Export complete.",
      completedAt: Date.now(),
    });
  } catch (error) {
    if (isCancelledRenderError(error)) {
      updateJob(jobId, {
        status: "cancelled",
        progress: 0,
        message: "Export cancelled.",
        completedAt: Date.now(),
      });
    } else {
      const message = error instanceof Error ? error.message : "Render failed.";
      console.error("[render]", error);
      updateJob(jobId, {
        status: "failed",
        progress: 0,
        error: message,
        message,
        completedAt: Date.now(),
      });
    }
  } finally {
    const job = renderJobs.get(jobId);
    if (job && job.status === "cancelled" && outputPath) {
      rmSync(join(outputPath, ".."), { recursive: true, force: true });
      job.outputPath = undefined;
    }
    scheduleJobCleanup(jobId);
  }
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/render", async (req, res) => {
  const body = req.body as RenderRequestBody;
  const { sequence, format, fps, durationInFrames } = body;

  if (!sequence || !format?.width || !format?.height || !fps || !durationInFrames) {
    res.status(400).send("Missing required render fields.");
    return;
  }

  const jobId = randomUUID();
  void runRenderJob(jobId, body);
  res.status(202).json({ jobId });
});

app.get("/api/render/:jobId", (req, res) => {
  const job = renderJobs.get(req.params.jobId);
  if (!job) {
    res.status(404).json({ error: "Render job not found." });
    return;
  }

  res.json({
    id: job.id,
    status: job.status,
    progress: job.progress,
    message: job.message,
    error: job.error,
    startedAt: job.startedAt,
    completedAt: job.completedAt,
  });
});

app.delete("/api/render/:jobId", (req, res) => {
  const job = renderJobs.get(req.params.jobId);
  if (!job) {
    res.status(404).json({ error: "Render job not found." });
    return;
  }

  if (job.status === "complete" || job.status === "failed" || job.status === "cancelled") {
    res.json({ id: job.id, status: job.status });
    return;
  }

  job.cancel();
  updateJob(job.id, {
    status: "cancelled",
    progress: 0,
    message: "Cancelling…",
  });
  res.json({ id: job.id, status: "cancelled" });
});

app.get("/api/render/:jobId/download", (req, res) => {
  const job = renderJobs.get(req.params.jobId);
  if (!job) {
    res.status(404).send("Render job not found.");
    return;
  }

  if (job.status !== "complete" || !job.outputPath) {
    res.status(409).send("Render is not complete yet.");
    return;
  }

  const fileBuffer = readFileSync(job.outputPath);
  const safeName = (job.fileName || "export").replace(/[^a-z0-9-_]+/gi, "-").toLowerCase();

  res.setHeader("Content-Type", "video/mp4");
  res.setHeader("Content-Disposition", `attachment; filename="${safeName}.mp4"`);
  res.send(fileBuffer);
});

const server = app.listen(PORT, () => {
  const root = getProjectRoot();
  watchSourceForBundleInvalidation(root);
  console.log(`Scatter render API listening on http://localhost:${PORT}`);
});

server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `[render] Port ${PORT} is already in use. Stop the other render API process (or prior \`npm run dev\`) and try again.`,
    );
    process.exit(1);
  }
  throw error;
});

function shutdown(signal: string) {
  console.log(`[render] ${signal} received, shutting down…`);
  for (const job of renderJobs.values()) {
    if (job.status !== "complete" && job.status !== "failed" && job.status !== "cancelled") {
      job.cancel();
    }
  }
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
