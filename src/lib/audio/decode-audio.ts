let sharedContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!sharedContext) {
    sharedContext = new AudioContext();
  }
  return sharedContext;
}

export async function decodeAudioFromDataUrl(dataUrl: string): Promise<AudioBuffer> {
  const response = await fetch(dataUrl);
  const arrayBuffer = await response.arrayBuffer();
  const context = getAudioContext();
  return context.decodeAudioData(arrayBuffer);
}

export async function getAudioDuration(dataUrl: string): Promise<number> {
  const buffer = await decodeAudioFromDataUrl(dataUrl);
  return buffer.duration;
}

export function getPeakAmplitude(buffer: AudioBuffer, startSec: number, endSec: number): number {
  const sampleRate = buffer.sampleRate;
  const startSample = Math.floor(startSec * sampleRate);
  const endSample = Math.min(Math.floor(endSec * sampleRate), buffer.length);
  const channel = buffer.getChannelData(0);
  let peak = 0;

  for (let i = startSample; i < endSample; i++) {
    const abs = Math.abs(channel[i] ?? 0);
    if (abs > peak) peak = abs;
  }

  return peak;
}

export function getRmsAmplitude(buffer: AudioBuffer, startSec: number, endSec: number): number {
  const sampleRate = buffer.sampleRate;
  const startSample = Math.floor(startSec * sampleRate);
  const endSample = Math.min(Math.floor(endSec * sampleRate), buffer.length);
  const channel = buffer.getChannelData(0);
  let sum = 0;
  let count = 0;

  for (let i = startSample; i < endSample; i++) {
    const sample = channel[i] ?? 0;
    sum += sample * sample;
    count++;
  }

  return count > 0 ? Math.sqrt(sum / count) : 0;
}
