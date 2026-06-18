import { decodeAudioFromDataUrl } from "./decode-audio";

type CacheEntry = {
  buffer: AudioBuffer;
  decodedAt: number;
};

const bufferCache = new Map<string, CacheEntry>();
const pendingDecodes = new Map<string, Promise<AudioBuffer>>();

export function getCachedAudioBuffer(assetId: string): AudioBuffer | undefined {
  return bufferCache.get(assetId)?.buffer;
}

export async function getOrDecodeAudioBuffer(
  assetId: string,
  dataUrl: string,
): Promise<AudioBuffer> {
  const cached = bufferCache.get(assetId);
  if (cached) return cached.buffer;

  const pending = pendingDecodes.get(assetId);
  if (pending) return pending;

  const decodePromise = decodeAudioFromDataUrl(dataUrl).then((buffer) => {
    bufferCache.set(assetId, { buffer, decodedAt: Date.now() });
    pendingDecodes.delete(assetId);
    return buffer;
  });

  pendingDecodes.set(assetId, decodePromise);
  return decodePromise;
}

export async function preloadAudioAssets(
  assets: Array<{ id: string; dataUrl: string; type: string }>,
): Promise<void> {
  const audioAssets = assets.filter((a) => a.type === "audio" && a.dataUrl);
  await Promise.all(
    audioAssets.map((asset) => getOrDecodeAudioBuffer(asset.id, asset.dataUrl)),
  );
}

export function clearAudioBufferCache(): void {
  bufferCache.clear();
  pendingDecodes.clear();
}

export function getAudioBufferCacheStats(): { entries: number; totalDurationSec: number } {
  let totalDurationSec = 0;
  for (const entry of bufferCache.values()) {
    totalDurationSec += entry.buffer.duration;
  }
  return { entries: bufferCache.size, totalDurationSec };
}
