import type { MotionFormat } from "@/types/format";
import type { MotionSequence } from "@/types/sequence";

export type ExportVideoInput = {
  sequence: MotionSequence;
  format: MotionFormat;
  fps: number;
  durationInFrames: number;
};

/**
 * TODO(phase-8): Wire up local Remotion rendering.
 *
 * Requires @remotion/bundler + @remotion/renderer, a dedicated Remotion entry
 * point (separate from the Vite app), and headless Chrome. Browser-only export
 * is not stable yet — keep the UI stubbed until that pipeline lands.
 */
export async function exportSequenceToMp4(_input: ExportVideoInput): Promise<Blob> {
  throw new Error("MP4 export is not implemented yet.");
}
