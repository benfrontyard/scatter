import type { BrandPreset } from "@/types/brand";
import type { MotionFormat } from "@/types/format";
import type { MotionSequence } from "@/types/sequence";

export type ExportVideoInput = {
  sequence: MotionSequence;
  format: MotionFormat;
  fps: number;
  durationInFrames: number;
  customBrands?: BrandPreset[];
  fileName?: string;
};

export type ExportStatus = "idle" | "rendering" | "done" | "error";

/**
 * Client export helper. POSTs to the local render API (see server/index.ts).
 * Requires `npm run dev` (Vite + render API) and VITE_EXPORT_ENABLED=true.
 */
export function isExportAvailable(): boolean {
  return import.meta.env.VITE_EXPORT_ENABLED === "true";
}

export async function exportSequenceToMp4(_input: ExportVideoInput): Promise<Blob> {
  if (!isExportAvailable()) {
    throw new Error(
      "MP4 export requires a Remotion render server. See export-video.ts for setup steps.",
    );
  }

  const response = await fetch("/api/render", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(_input),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Render request failed.");
  }

  return response.blob();
}
