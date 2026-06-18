import type { PlayerRef } from "@remotion/player";
import { WebAudioEngine } from "@/lib/audio/audio-engine";
import type { AudioEngineConfig } from "@/lib/audio/audio-engine";
import { PerformanceMonitor } from "./performance-monitor";
import { resolveEffectivePreviewQuality } from "./preview-quality";
import type { PostFXQuality } from "@/types/post-fx";

export type PlaybackEngineCallbacks = {
  onFrameChange?: (frame: number) => void;
  onPlayingChange?: (playing: boolean) => void;
  onQualityChange?: (quality: PostFXQuality) => void;
};

export type PlaybackEngineOptions = {
  fps: number;
  durationFrames: number;
  previewQualitySetting: PostFXQuality | "auto";
  callbacks?: PlaybackEngineCallbacks;
};

const UI_UPDATE_INTERVAL_MS = 100;

export class PreviewPlaybackEngine {
  private audioEngine: WebAudioEngine;
  private perfMonitor: PerformanceMonitor;
  private playerRef: PlayerRef | null = null;
  private options: PlaybackEngineOptions;
  private rafId: number | null = null;
  private isPlaying = false;
  private currentFrame = 0;
  private lastUIUpdate = 0;
  private effectiveQuality: PostFXQuality = "medium";
  private useWallClock = false;
  private wallClockStartPerf = 0;
  private wallClockStartTimelineSec = 0;

  constructor(options: PlaybackEngineOptions) {
    this.options = options;
    this.audioEngine = new WebAudioEngine();
    this.perfMonitor = new PerformanceMonitor(options.fps);

    this.perfMonitor.onUpdate((stats) => {
      if (this.options.previewQualitySetting === "auto") {
        const next = resolveEffectivePreviewQuality(
          "auto",
          stats.fps,
          this.options.fps,
        );
        if (next !== this.effectiveQuality) {
          this.effectiveQuality = next;
          this.options.callbacks?.onQualityChange?.(next);
        }
      }
    });
  }

  getEffectivePreviewQuality(): PostFXQuality {
    if (this.options.previewQualitySetting !== "auto") {
      return this.options.previewQualitySetting;
    }
    return this.effectiveQuality;
  }

  getCurrentFrame(): number {
    return this.currentFrame;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  setPlayer(player: PlayerRef | null): void {
    this.playerRef = player;
  }

  updateOptions(partial: Partial<PlaybackEngineOptions>): void {
    this.options = { ...this.options, ...partial };
    if (partial.previewQualitySetting && partial.previewQualitySetting !== "auto") {
      this.effectiveQuality = partial.previewQualitySetting;
    }
  }

  async prepareAudio(config: AudioEngineConfig): Promise<void> {
    await this.audioEngine.prepare(config);
  }

  async play(): Promise<void> {
    // #region agent log
    fetch('http://127.0.0.1:7333/ingest/b24888df-fe91-4b21-bfa6-9cf313f7d223',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'3f7d42'},body:JSON.stringify({sessionId:'3f7d42',location:'playback-engine.ts:84',message:'play entry',data:{isPlaying:this.isPlaying,currentFrame:this.currentFrame,hasPlayer:!!this.playerRef},timestamp:Date.now(),hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    if (this.isPlaying) return;

    const startSec = this.currentFrame / this.options.fps;
    this.isPlaying = true;
    this.options.callbacks?.onPlayingChange?.(true);

    await this.audioEngine.play(startSec);

    if (!this.isPlaying) {
      // #region agent log
      fetch('http://127.0.0.1:7333/ingest/b24888df-fe91-4b21-bfa6-9cf313f7d223',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'3f7d42'},body:JSON.stringify({sessionId:'3f7d42',location:'playback-engine.ts:99',message:'play aborted after await',data:{},timestamp:Date.now(),hypothesisId:'B',runId:'post-fix-2'})}).catch(()=>{});
      // #endregion
      return;
    }

    this.useWallClock = !this.audioEngine.isClockRunning();
    if (this.useWallClock) {
      this.wallClockStartPerf = performance.now();
      this.wallClockStartTimelineSec = startSec;
      this.playerRef?.seekTo(this.currentFrame);
      this.playerRef?.play();
    }

    this.perfMonitor.start();
    this.startVisualLoop();
    // #region agent log
    fetch('http://127.0.0.1:7333/ingest/b24888df-fe91-4b21-bfa6-9cf313f7d223',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'3f7d42'},body:JSON.stringify({sessionId:'3f7d42',location:'playback-engine.ts:95',message:'play complete',data:{isPlaying:this.isPlaying,startSec,hasPlayer:!!this.playerRef,useWallClock:this.useWallClock},timestamp:Date.now(),hypothesisId:'B',runId:'post-fix'})}).catch(()=>{});
    // #endregion
  }

  pause(): void {
    if (!this.isPlaying) return;

    const timeSec = this.getTimelineTimeSec();

    this.audioEngine.pause();
    this.isPlaying = false;

    if (this.useWallClock && this.playerRef) {
      this.currentFrame = this.playerRef.getCurrentFrame();
    } else {
      this.currentFrame = Math.min(
        this.options.durationFrames - 1,
        Math.round(timeSec * this.options.fps),
      );
    }

    this.useWallClock = false;
    this.wallClockStartTimelineSec = timeSec;
    this.stopVisualLoop();
    this.perfMonitor.stop();
    this.playerRef?.pause();
    this.options.callbacks?.onPlayingChange?.(false);
    this.options.callbacks?.onFrameChange?.(this.currentFrame);
  }

  toggle(): void {
    // #region agent log
    fetch('http://127.0.0.1:7333/ingest/b24888df-fe91-4b21-bfa6-9cf313f7d223',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'3f7d42'},body:JSON.stringify({sessionId:'3f7d42',location:'playback-engine.ts:113',message:'toggle',data:{isPlaying:this.isPlaying},timestamp:Date.now(),hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    if (this.isPlaying) {
      this.pause();
    } else {
      void this.play();
    }
  }

  seekToFrame(frame: number): void {
    const clamped = Math.max(0, Math.min(frame, this.options.durationFrames - 1));
    this.currentFrame = clamped;

    const timeSec = clamped / this.options.fps;
    this.audioEngine.seek(timeSec);
    this.wallClockStartTimelineSec = timeSec;
    this.playerRef?.seekTo(clamped);

    if (this.isPlaying) {
      if (this.useWallClock) {
        this.wallClockStartPerf = performance.now();
        this.playerRef?.play();
      } else {
        void this.audioEngine.play(timeSec);
      }
    }

    this.options.callbacks?.onFrameChange?.(clamped);
  }

  private getTimelineTimeSec(): number {
    if (this.audioEngine.isClockRunning()) {
      return this.audioEngine.getTimelineTime();
    }
    if (this.useWallClock && this.isPlaying) {
      return (
        this.wallClockStartTimelineSec +
        (performance.now() - this.wallClockStartPerf) / 1000
      );
    }
    return this.currentFrame / this.options.fps;
  }

  dispose(): void {
    this.stopVisualLoop();
    this.perfMonitor.stop();
    this.audioEngine.dispose();
  }

  private startVisualLoop(): void {
    if (this.rafId !== null) return;
    let loopCount = 0;

    const loop = () => {
      this.rafId = null;

      if (!this.isPlaying) return;

      const timeSec = this.getTimelineTimeSec();
      let frame = Math.min(
        this.options.durationFrames - 1,
        Math.round(timeSec * this.options.fps),
      );

      if (loopCount < 5 || loopCount % 30 === 0) {
        // #region agent log
        fetch('http://127.0.0.1:7333/ingest/b24888df-fe91-4b21-bfa6-9cf313f7d223',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'3f7d42'},body:JSON.stringify({sessionId:'3f7d42',location:'playback-engine.ts:loop',message:'visual loop tick',data:{loopCount,timeSec,frame,hasPlayer:!!this.playerRef,useWallClock:this.useWallClock,durationSec:this.options.durationFrames/this.options.fps},timestamp:Date.now(),hypothesisId:'D',runId:'post-fix'})}).catch(()=>{});
        // #endregion
      }
      loopCount++;

      if (!this.useWallClock && frame !== this.currentFrame) {
        this.currentFrame = frame;
        this.playerRef?.seekTo(frame);
      } else if (this.useWallClock && this.playerRef) {
        const playerFrame = this.playerRef.getCurrentFrame();
        if (playerFrame !== this.currentFrame) {
          this.currentFrame = playerFrame;
          frame = playerFrame;
        }
      }

      const now = performance.now();
      if (now - this.lastUIUpdate >= UI_UPDATE_INTERVAL_MS) {
        this.lastUIUpdate = now;
        this.options.callbacks?.onFrameChange?.(frame);
      }

      const durationSec = this.options.durationFrames / this.options.fps;
      if (timeSec >= durationSec || frame >= this.options.durationFrames - 1) {
        // #region agent log
        fetch('http://127.0.0.1:7333/ingest/b24888df-fe91-4b21-bfa6-9cf313f7d223',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'3f7d42'},body:JSON.stringify({sessionId:'3f7d42',location:'playback-engine.ts:end',message:'playback end reached',data:{timeSec,durationSec},timestamp:Date.now(),hypothesisId:'F'})}).catch(()=>{});
        // #endregion
        this.pause();
        this.seekToFrame(0);
        return;
      }

      this.rafId = requestAnimationFrame(loop);
    };

    this.rafId = requestAnimationFrame(loop);
  }

  private stopVisualLoop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}
