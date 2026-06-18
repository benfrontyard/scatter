import { Player } from "@remotion/player";
import { useEditor } from "@/context/editor-context";
import { isPreviewQualityReduced } from "@/lib/post-fx";
import { getSequenceDurationInFrames } from "@/lib/sequence-utils";
import { ScatterComposition } from "@/remotion/ScatterComposition";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGoogleFont } from "@/hooks/use-google-font";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { Pause, Play } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { PlayerRef } from "@remotion/player";

type PreviewPanelProps = {
  className?: string;
  showMeta?: boolean;
};

function formatTime(seconds: number): string {
  const clamped = Math.max(0, seconds);
  const mins = Math.floor(clamped / 60);
  const secs = Math.floor(clamped % 60);
  const frames = Math.floor((clamped % 1) * 100);
  if (mins > 0) {
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }
  return `${secs}.${frames.toString().padStart(2, "0").slice(0, 1)}s`;
}

function fitCanvasToContainer(
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

export function PreviewPanel({ className, showMeta = true }: PreviewPanelProps) {
  const {
    sequence,
    customBrands,
    assets,
    brand,
    format,
    fps,
    isPlaying,
    currentFrame,
    togglePlayback,
    setCurrentFrame,
    setIsPlaying,
    postFx,
    registerPlayer,
  } = useEditor();
  const reducedMotion = useReducedMotion();
  useGoogleFont(brand.typography.fontFamilies.heading);
  useGoogleFont(brand.typography.fontFamilies.body);
  useGoogleFont(brand.typography.fontFamilies.accent);

  const playerRef = useRef<PlayerRef>(null);
  const canvasAreaRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number } | null>(null);

  const durationInFrames = useMemo(
    () => getSequenceDurationInFrames(sequence),
    [sequence],
  );

  const compositionWidth = format.width;
  const compositionHeight = format.height;
  const currentTime = currentFrame / fps;
  const totalTime = durationInFrames / fps;

  useEffect(() => {
    registerPlayer(playerRef.current);
    return () => registerPlayer(null);
  }, [registerPlayer, durationInFrames]);

  useEffect(() => {
    const area = canvasAreaRef.current;
    if (!area) return;

    const updateSize = () => {
      const { width, height } = area.getBoundingClientRect();
      setCanvasSize(
        fitCanvasToContainer(width, height, compositionWidth, compositionHeight),
      );
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(area);
    return () => observer.disconnect();
  }, [compositionWidth, compositionHeight]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onFrameUpdate = (event: { detail: { frame: number } }) => {
      setCurrentFrame(event.detail.frame);
    };

    player.addEventListener("play", onPlay);
    player.addEventListener("pause", onPause);
    player.addEventListener("frameupdate", onFrameUpdate);

    return () => {
      player.removeEventListener("play", onPlay);
      player.removeEventListener("pause", onPause);
      player.removeEventListener("frameupdate", onFrameUpdate);
    };
  }, [durationInFrames, setCurrentFrame, setIsPlaying]);

  const canvasStyle = canvasSize
    ? { width: canvasSize.width, height: canvasSize.height }
    : {
        width: "100%",
        maxWidth: compositionWidth > compositionHeight ? 720 : 360,
        aspectRatio: `${compositionWidth} / ${compositionHeight}`,
      };

  return (
    <div
      className={cn(
        "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-preview-surface",
        className,
      )}
    >
      {showMeta && (
        <div className="flex shrink-0 items-center justify-between border-b border-border px-3 py-2 sm:px-4">
          <div className="min-w-0">
            <p className="truncate text-xs font-medium sm:text-sm">{sequence.name}</p>
            <p className="truncate text-[10px] text-muted-foreground sm:text-xs">
              {format.aspectRatio} · {format.width}×{format.height} · {fps}fps
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span
              className="font-mono text-[10px] tabular-nums text-muted-foreground sm:text-xs"
              aria-live="polite"
            >
              {formatTime(currentTime)} / {formatTime(totalTime)}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={togglePlayback}
              aria-label={isPlaying ? "Pause preview" : "Play preview"}
            >
              {isPlaying ? (
                <Pause className="h-3.5 w-3.5" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>
      )}

      <div
        ref={canvasAreaRef}
        className="flex min-h-0 flex-1 items-center justify-center overflow-hidden p-3 sm:p-6"
      >
        <div
          className="relative shrink-0 overflow-hidden rounded border border-border bg-black shadow-lg"
          style={canvasStyle}
        >
          <Player
            ref={playerRef}
            component={ScatterComposition}
            inputProps={{ sequence, customBrands, assets, renderMode: "preview", reducedMotion }}
            durationInFrames={durationInFrames}
            compositionWidth={compositionWidth}
            compositionHeight={compositionHeight}
            fps={fps}
            style={{ width: "100%", height: "100%" }}
            controls={false}
            loop
            autoPlay
          />

          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5" />
          {postFx.enabled && isPreviewQualityReduced(postFx) ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center p-2">
              <span className="rounded-full bg-black/70 px-2.5 py-1 text-[10px] text-white/80 backdrop-blur-sm">
                Previewing Post FX at reduced quality. Full quality will apply on export.
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {!showMeta && (
        <div className="flex shrink-0 items-center justify-center gap-3 border-t border-border py-2">
          <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
            {formatTime(currentTime)} / {formatTime(totalTime)}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={togglePlayback}
            aria-label={isPlaying ? "Pause preview" : "Play preview"}
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {isPlaying ? "Pause" : "Play"}
          </Button>
        </div>
      )}
    </div>
  );
}
