/** Shared canvas sizing logic for Canvas editor and Studio preview. */
export function fitCanvasToContainer(
  containerWidth: number,
  containerHeight: number,
  compositionWidth: number,
  compositionHeight: number,
): { width: number; height: number } {
  const aspect = compositionWidth / compositionHeight;
  const maxWidth = compositionWidth > compositionHeight ? 720 : 360;

  let width = Math.min(containerWidth, maxWidth);
  let height = width / aspect;

  if (height > containerHeight) {
    height = containerHeight;
    width = height * aspect;
  }

  return {
    width: Math.max(0, Math.floor(width)),
    height: Math.max(0, Math.floor(height)),
  };
}

export function formatPreviewTime(seconds: number): string {
  const clamped = Math.max(0, seconds);
  const mins = Math.floor(clamped / 60);
  const secs = Math.floor(clamped % 60);
  const frames = Math.floor((clamped % 1) * 100);
  if (mins > 0) {
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }
  return `${secs}.${frames.toString().padStart(2, "0").slice(0, 1)}s`;
}
