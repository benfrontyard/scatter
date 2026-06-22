import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PlayerRef } from "@remotion/player";
import type { MotionSequence, ProjectAsset } from "@/types";
import type { PostFXQuality } from "@/types/post-fx";
import { getSequenceDurationInFrames } from "@/lib/sequence-utils";
import { preloadAudioAssets } from "@/lib/audio/audio-buffer-cache";
import {
  PreviewPlaybackEngine,
  buildTimelineCache,
  previewDisplayState,
  type TimelineCache,
} from "@/lib/playback";

export type UsePlaybackEngineOptions = {
  sequence: MotionSequence;
  assets: ProjectAsset[];
  previewQuality: PostFXQuality | "auto";
  onFrameChange?: (frame: number) => void;
  onPlayingChange?: (playing: boolean) => void;
};

export function usePlaybackEngine({
  sequence,
  assets,
  previewQuality,
  onFrameChange,
  onPlayingChange,
}: UsePlaybackEngineOptions) {
  const fps = sequence.fps ?? 30;
  const durationFrames = getSequenceDurationInFrames(sequence);
  const engineRef = useRef<PreviewPlaybackEngine | null>(null);
  const timelineCacheRef = useRef<TimelineCache | null>(null);
  const [effectiveQuality, setEffectiveQuality] = useState<PostFXQuality>("medium");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);

  const onFrameChangeRef = useRef(onFrameChange);
  const onPlayingChangeRef = useRef(onPlayingChange);
  onFrameChangeRef.current = onFrameChange;
  onPlayingChangeRef.current = onPlayingChange;

  useEffect(() => {
    const engine = new PreviewPlaybackEngine({
      fps,
      durationFrames,
      previewQualitySetting: previewQuality,
      callbacks: {
        onFrameChange: (frame) => {
          setCurrentFrame(frame);
          onFrameChangeRef.current?.(frame);
        },
        onTimeSecChange: (timeSec) => {
          setCurrentTimeSec(timeSec);
        },
        onPlayingChange: (playing) => {
          previewDisplayState.isPlaying = playing;
          setIsPlaying(playing);
          onPlayingChangeRef.current?.(playing);
        },
        onQualityChange: (quality) => {
          previewDisplayState.effectiveQuality = quality;
          setEffectiveQuality(quality);
        },
      },
    });

    engineRef.current = engine;
    setEffectiveQuality(
      previewQuality === "auto" ? "medium" : previewQuality,
    );
    previewDisplayState.effectiveQuality =
      previewQuality === "auto" ? "medium" : previewQuality;
    previewDisplayState.isPlaying = false;

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    engineRef.current?.updateOptions({
      fps,
      durationFrames,
      previewQualitySetting: previewQuality,
    });
    if (previewQuality !== "auto") {
      setEffectiveQuality(previewQuality);
      previewDisplayState.effectiveQuality = previewQuality;
    }
  }, [fps, durationFrames, previewQuality]);

  useEffect(() => {
    timelineCacheRef.current = buildTimelineCache(sequence);
  }, [sequence]);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    const totalDurationSec = durationFrames / fps;
    void preloadAudioAssets(assets).then(() => {
      void engine.prepareAudio({
        audio: sequence.audio,
        assets,
        totalDurationSec,
        fps,
      });
    });
  }, [sequence.audio, assets, durationFrames, fps]);

  const registerPlayer = useCallback((player: PlayerRef | null) => {
    // #region agent log
    fetch('http://127.0.0.1:7333/ingest/b24888df-fe91-4b21-bfa6-9cf313f7d223',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'3f7d42'},body:JSON.stringify({sessionId:'3f7d42',location:'use-playback-engine.ts:101',message:'registerPlayer',data:{hasPlayer:!!player},timestamp:Date.now(),hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    engineRef.current?.setPlayer(player);
  }, []);

  const play = useCallback(() => {
    void engineRef.current?.play();
  }, []);

  const pause = useCallback(() => {
    engineRef.current?.pause();
  }, []);

  const togglePlayback = useCallback(() => {
    engineRef.current?.toggle();
  }, []);

  const seekToFrame = useCallback((frame: number) => {
    engineRef.current?.seekToFrame(frame);
  }, []);

  return useMemo(
    () => ({
      currentFrame,
      currentTimeSec,
      isPlaying,
      effectiveQuality,
      timelineCache: timelineCacheRef.current,
      registerPlayer,
      play,
      pause,
      togglePlayback,
      seekToFrame,
    }),
    [
      currentFrame,
      currentTimeSec,
      isPlaying,
      effectiveQuality,
      registerPlayer,
      play,
      pause,
      togglePlayback,
      seekToFrame,
    ],
  );
}
