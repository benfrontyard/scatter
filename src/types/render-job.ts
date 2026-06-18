export type RenderJobStatus =
  | "queued"
  | "rendering"
  | "encoding"
  | "uploading"
  | "complete"
  | "failed"
  | "cancelled";

export type RenderJob = {
  id: string;
  status: RenderJobStatus;
  progress: number;
  message?: string;
  outputUrl?: string;
  error?: string;
  startedAt: number;
  completedAt?: number;
};

export function createRenderJob(id?: string): RenderJob {
  return {
    id: id ?? `render-${crypto.randomUUID().slice(0, 8)}`,
    status: "queued",
    progress: 0,
    startedAt: Date.now(),
  };
}

export function updateRenderJobProgress(
  job: RenderJob,
  status: RenderJobStatus,
  progress: number,
  message?: string,
): RenderJob {
  return {
    ...job,
    status,
    progress: Math.max(0, Math.min(100, progress)),
    message,
    completedAt: status === "complete" || status === "failed" || status === "cancelled" ? Date.now() : job.completedAt,
  };
}
