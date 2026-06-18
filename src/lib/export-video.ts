import type { BrandPreset } from "@/types/brand";
import type { MotionFormat } from "@/types/format";
import type { MotionSequence } from "@/types/sequence";
import type { ProjectAsset } from "@/types";
import {
  createRenderJob,
  updateRenderJobProgress,
  type RenderJob,
  type RenderJobStatus,
} from "@/types/render-job";

export type ExportVideoInput = {
  sequence: MotionSequence;
  format: MotionFormat;
  fps: number;
  durationInFrames: number;
  customBrands?: BrandPreset[];
  assets?: ProjectAsset[];
  fileName?: string;
  onProgress?: (job: RenderJob) => void;
  signal?: AbortSignal;
};

export type ExportStatus = "idle" | "rendering" | "done" | "error" | "cancelled";

export class ExportCancelledError extends Error {
  constructor() {
    super("Export cancelled.");
    this.name = "ExportCancelledError";
  }
}

/**
 * Client export helper. POSTs to the local render API (see server/index.ts).
 * Requires `npm run dev` (Vite + render API) and VITE_EXPORT_ENABLED=true.
 */
export function isExportAvailable(): boolean {
  return import.meta.env.VITE_EXPORT_ENABLED === "true";
}

type ServerRenderJobResponse = {
  id: string;
  status: RenderJobStatus | "cancelled";
  progress: number;
  message?: string;
  error?: string;
};

const POLL_INTERVAL_MS = 500;

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new ExportCancelledError());
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(new ExportCancelledError());
      },
      { once: true },
    );
  });
}

function mapServerStatus(status: ServerRenderJobResponse["status"]): RenderJobStatus {
  return status;
}

async function pollRenderJob(
  jobId: string,
  localJob: RenderJob,
  onProgress: ((job: RenderJob) => void) | undefined,
  signal?: AbortSignal,
): Promise<ServerRenderJobResponse> {
  while (true) {
    if (signal?.aborted) {
      throw new ExportCancelledError();
    }

    const response = await fetch(`/api/render/${jobId}`, { signal });
    if (!response.ok) {
      throw new Error(await response.text());
    }

    const serverJob = (await response.json()) as ServerRenderJobResponse;
    localJob = updateRenderJobProgress(
      localJob,
      mapServerStatus(serverJob.status),
      serverJob.progress,
      serverJob.message ?? serverJob.error,
    );
    onProgress?.(localJob);

    if (serverJob.status === "complete") {
      return serverJob;
    }
    if (serverJob.status === "failed") {
      // #region agent log
      fetch("http://127.0.0.1:7333/ingest/b24888df-fe91-4b21-bfa6-9cf313f7d223", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "84895d" },
        body: JSON.stringify({
          sessionId: "84895d",
          runId: "pre-fix",
          hypothesisId: "C",
          location: "export-video.ts:pollFailed",
          message: "Render job failed",
          data: { jobId, error: serverJob.error, message: serverJob.message },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      throw new Error(serverJob.error || serverJob.message || "Render failed.");
    }
    if (serverJob.status === "cancelled") {
      throw new ExportCancelledError();
    }

    await sleep(POLL_INTERVAL_MS, signal);
  }
}

async function cancelRenderJob(jobId: string): Promise<void> {
  try {
    await fetch(`/api/render/${jobId}`, { method: "DELETE" });
  } catch {
    // Best-effort cancel; server may already be done.
  }
}

export async function exportSequenceToMp4(input: ExportVideoInput): Promise<Blob> {
  if (!isExportAvailable()) {
    throw new Error(
      "MP4 export requires a Remotion render server. See export-video.ts for setup steps.",
    );
  }

  let job = createRenderJob();
  input.onProgress?.(job);

  job = updateRenderJobProgress(job, "queued", 0, "Starting export…");
  input.onProgress?.(job);

  const startResponse = await fetch("/api/render", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    signal: input.signal,
  });

  const startContentType = startResponse.headers.get("content-type") ?? "";
  // #region agent log
  fetch("http://127.0.0.1:7333/ingest/b24888df-fe91-4b21-bfa6-9cf313f7d223", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "84895d" },
    body: JSON.stringify({
      sessionId: "84895d",
      runId: "pre-fix",
      hypothesisId: "A",
      location: "export-video.ts:startResponse",
      message: "Render POST response",
      data: {
        ok: startResponse.ok,
        status: startResponse.status,
        contentType: startContentType,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  if (!startResponse.ok) {
    const message = await startResponse.text();
    job = updateRenderJobProgress(job, "failed", 0, message || "Render request failed.");
    input.onProgress?.(job);
    throw new Error(message || "Render request failed.");
  }

  if (startContentType.includes("video/mp4")) {
    throw new Error(
      "Render server is out of date. Stop and restart `npm run dev` so the export API reloads.",
    );
  }

  let jobId: string;
  try {
    ({ jobId } = (await startResponse.json()) as { jobId: string });
  } catch (error) {
    // #region agent log
    fetch("http://127.0.0.1:7333/ingest/b24888df-fe91-4b21-bfa6-9cf313f7d223", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "84895d" },
      body: JSON.stringify({
        sessionId: "84895d",
        runId: "pre-fix",
        hypothesisId: "A",
        location: "export-video.ts:startJsonParse",
        message: "Failed to parse render POST JSON",
        data: {
          contentType: startContentType,
          error: error instanceof Error ? error.message : String(error),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    throw new Error(
      "Unexpected render server response. Restart `npm run dev` and try export again.",
    );
  }

  const abortHandler = () => {
    void cancelRenderJob(jobId);
  };
  input.signal?.addEventListener("abort", abortHandler, { once: true });

  try {
    await pollRenderJob(jobId, job, input.onProgress, input.signal);

    job = updateRenderJobProgress(job, "uploading", 98, "Preparing download…");
    input.onProgress?.(job);

    const downloadResponse = await fetch(`/api/render/${jobId}/download`, {
      signal: input.signal,
    });
    if (!downloadResponse.ok) {
      const message = await downloadResponse.text();
      throw new Error(message || "Download failed.");
    }

    const blob = await downloadResponse.blob();

    job = updateRenderJobProgress(job, "complete", 100, "Export complete.");
    input.onProgress?.(job);

    return blob;
  } catch (error) {
    if (error instanceof ExportCancelledError || input.signal?.aborted) {
      await cancelRenderJob(jobId);
      throw new ExportCancelledError();
    }
    throw error;
  } finally {
    input.signal?.removeEventListener("abort", abortHandler);
  }
}

export async function cancelExport(controller?: AbortController): Promise<void> {
  controller?.abort();
}
