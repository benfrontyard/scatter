import type { AudioMixSettings, SequenceAudio } from "@/types";
import { DEFAULT_AUDIO_MIX } from "@/types/audio";
import { computeMusicVolumeAtTime, isVoiceoverActive } from "./audio-mix";
import { getCachedAudioBuffer, getOrDecodeAudioBuffer } from "./audio-buffer-cache";
import type { ProjectAsset } from "@/types";

export type AudioEngineTrack = "voiceover" | "music" | "sfx";

export type AudioEngineConfig = {
  audio?: SequenceAudio;
  assets: ProjectAsset[];
  totalDurationSec: number;
  fps: number;
};

type ActiveSource = {
  source: AudioBufferSourceNode;
  gain: GainNode;
  track: AudioEngineTrack;
};

export class WebAudioEngine {
  private context: AudioContext;
  private masterGain: GainNode;
  private trackGains: Record<AudioEngineTrack, GainNode>;
  private config: AudioEngineConfig | null = null;
  private activeSources: ActiveSource[] = [];
  private playbackStartContextTime = 0;
  private playbackStartTimelineSec = 0;
  private isRunning = false;
  private duckingRafId: number | null = null;

  constructor() {
    this.context = new AudioContext();
    this.masterGain = this.context.createGain();
    this.masterGain.connect(this.context.destination);

    this.trackGains = {
      voiceover: this.context.createGain(),
      music: this.context.createGain(),
      sfx: this.context.createGain(),
    };

    for (const gain of Object.values(this.trackGains)) {
      gain.connect(this.masterGain);
    }
  }

  get audioContext(): AudioContext {
    return this.context;
  }

  async prepare(config: AudioEngineConfig): Promise<void> {
    this.config = config;
    const { audio, assets } = config;
    if (!audio) return;

    const decodeTasks: Promise<void>[] = [];

    if (audio.voiceover) {
      const asset = assets.find((a) => a.id === audio.voiceover!.assetId);
      if (asset?.dataUrl) {
        decodeTasks.push(
          getOrDecodeAudioBuffer(asset.id, asset.dataUrl).then(() => undefined),
        );
      }
    }

    if (audio.music) {
      const asset = assets.find((a) => a.id === audio.music!.assetId);
      if (asset?.dataUrl) {
        decodeTasks.push(
          getOrDecodeAudioBuffer(asset.id, asset.dataUrl).then(() => undefined),
        );
      }
    }

    await Promise.all(decodeTasks);
  }

  setTrackGain(track: AudioEngineTrack, gain: number): void {
    this.trackGains[track].gain.value = Math.max(0, Math.min(2, gain));
  }

  getTimelineTime(): number {
    if (!this.isRunning) return this.playbackStartTimelineSec;
    return this.playbackStartTimelineSec + (this.context.currentTime - this.playbackStartContextTime);
  }

  isClockRunning(): boolean {
    return this.isRunning;
  }

  hasAudioConfig(): boolean {
    return Boolean(this.config?.audio);
  }

  async play(fromTimelineSec = 0): Promise<void> {
    // #region agent log
    fetch('http://127.0.0.1:7333/ingest/b24888df-fe91-4b21-bfa6-9cf313f7d223',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'3f7d42'},body:JSON.stringify({sessionId:'3f7d42',location:'audio-engine.ts:90',message:'audio play called',data:{hasConfig:!!this.config?.audio,fromTimelineSec,contextState:this.context.state},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    if (!this.config?.audio) return;

    await this.context.resume();
    this.stopSources();

    this.playbackStartTimelineSec = fromTimelineSec;
    this.playbackStartContextTime = this.context.currentTime;
    this.isRunning = true;
    // #region agent log
    fetch('http://127.0.0.1:7333/ingest/b24888df-fe91-4b21-bfa6-9cf313f7d223',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'3f7d42'},body:JSON.stringify({sessionId:'3f7d42',location:'audio-engine.ts:100',message:'audio play started',data:{isRunning:this.isRunning,activeSources:this.activeSources.length},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    const mix = this.config.audio.mix ?? DEFAULT_AUDIO_MIX;
    const { audio, assets, totalDurationSec } = this.config;

    if (audio.music) {
      const asset = assets.find((a) => a.id === audio.music!.assetId);
      const buffer = asset ? getCachedAudioBuffer(asset.id) : undefined;
      if (buffer) {
        this.startBuffer(buffer, "music", fromTimelineSec, mix.musicVolume);
      }
    }

    if (audio.voiceover) {
      const asset = assets.find((a) => a.id === audio.voiceover!.assetId);
      const buffer = asset ? getCachedAudioBuffer(asset.id) : undefined;
      if (buffer) {
        const trimStart = audio.voiceover.trimStart ?? 0;
        const offset = trimStart + fromTimelineSec;
        this.trackGains.voiceover.gain.value = mix.voiceoverVolume;
        this.startBufferAtOffset(buffer, "voiceover", offset, mix.voiceoverVolume);
      }
    }

    if (mix.duckingEnabled && audio.music) {
      this.startDuckingLoop(mix, audio, totalDurationSec);
    }
  }

  pause(): void {
    const currentTime = this.getTimelineTime();
    this.stopSources();
    this.playbackStartTimelineSec = currentTime;
    this.isRunning = false;
  }

  seek(timelineSec: number): void {
    const wasRunning = this.isRunning;
    this.pause();
    this.playbackStartTimelineSec = timelineSec;
    if (wasRunning) {
      void this.play(timelineSec);
    }
  }

  stop(): void {
    this.stopSources();
    this.playbackStartTimelineSec = 0;
    this.isRunning = false;
  }

  dispose(): void {
    this.stopSources();
    void this.context.close();
  }

  private startBuffer(
    buffer: AudioBuffer,
    track: AudioEngineTrack,
    timelineOffsetSec: number,
    volume: number,
  ): void {
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.connect(this.trackGains[track]);
    this.trackGains[track].gain.value = volume;

    const startAt = this.playbackStartContextTime;
    source.start(startAt, timelineOffsetSec);
    this.activeSources.push({ source, gain: this.trackGains[track], track });
  }

  private startBufferAtOffset(
    buffer: AudioBuffer,
    track: AudioEngineTrack,
    bufferOffsetSec: number,
    volume: number,
  ): void {
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.connect(this.trackGains[track]);
    this.trackGains[track].gain.value = volume;

    const startAt = this.playbackStartContextTime;
    const clampedOffset = Math.min(bufferOffsetSec, buffer.duration);
    source.start(startAt, clampedOffset);
    this.activeSources.push({ source, gain: this.trackGains[track], track });
  }

  private startDuckingLoop(
    mix: AudioMixSettings,
    audio: SequenceAudio,
    totalDurationSec: number,
  ): void {
    const update = () => {
      if (!this.isRunning) return;

      const timeSec = this.getTimelineTime();
      const voActive = isVoiceoverActive(audio.voiceover?.analysis, timeSec);
      const volume = computeMusicVolumeAtTime(mix, timeSec, voActive, totalDurationSec);
      this.trackGains.music.gain.setTargetAtTime(volume, this.context.currentTime, 0.05);

      this.duckingRafId = requestAnimationFrame(update);
    };

    this.duckingRafId = requestAnimationFrame(update);
  }

  private stopSources(): void {
    if (this.duckingRafId !== null) {
      cancelAnimationFrame(this.duckingRafId);
      this.duckingRafId = null;
    }

    for (const active of this.activeSources) {
      try {
        active.source.stop();
        active.source.disconnect();
      } catch {
        // Source may already be stopped
      }
    }
    this.activeSources = [];
  }
}
