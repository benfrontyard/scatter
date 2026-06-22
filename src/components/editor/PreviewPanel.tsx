import { Player } from "@remotion/player";
import { useEditor } from "@/context/editor-context";
import { isPreviewQualityReduced } from "@/lib/post-fx";
import { getSequenceDurationInFrames } from "@/lib/sequence-utils";
import { ScatterComposition } from "@/remotion/ScatterComposition";
import { PreviewPerformanceOverlay } from "@/components/editor/PreviewPerformanceOverlay";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGoogleFont } from "@/hooks/use-google-font";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { Pause, Play } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type RefCallback } from "react";
import type { PlayerRef } from "@remotion/player";

type PreviewPanelProps = {
  className?: string;
  showMeta?: boolean;
};

import { fitCanvasToContainer, formatPreviewTime } from "@/lib/editor-canvas";

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
    registerPlayer,
    postFx,
    isAdminMode,
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

  const handlePlayerRef: RefCallback<PlayerRef> = useCallback(
    (player) => {
      playerRef.current = player;
      if (player) {
        registerPlayer(player);
      }
    },
    [registerPlayer],
  );

  const playerInputProps = useMemo(
    () => ({
      sequence,
      customBrands,
      assets,
      renderMode: "preview" as const,
      reducedMotion,
      muteRemotionAudio: true,
    }),
    [sequence, customBrands, assets, reducedMotion],
  );

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
              {formatPreviewTime(currentTime)} / {formatPreviewTime(totalTime)}
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
            ref={handlePlayerRef}
            component={ScatterComposition}
            inputProps={playerInputProps}
            durationInFrames={durationInFrames}
            compositionWidth={compositionWidth}
            compositionHeight={compositionHeight}
            fps={fps}
            style={{ width: "100%", height: "100%" }}
            controls={false}
            loop={false}
            autoPlay={false}
            clickToPlay={false}
          />

          {isAdminMode ? (
            <PreviewPerformanceOverlay isPlaying={isPlaying} targetFps={fps} />
          ) : null}

          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5" />
          {postFx.enabled && isPreviewQualityReduced(postFx) ? (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center p-2">
              <span className="rounded-full bg-black/70 px-2.5 py-1 text-[10px] text-white/80 backdrop-blur-sm">
                Previewing at reduced quality. Full quality applies on export.
                {postFx.previewQuality === "auto" ? " (Auto)" : ""}
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {!showMeta && (
        <div className="flex shrink-0 items-center justify-center gap-3 border-t border-border py-2">
          <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
            {formatPreviewTime(currentTime)} / {formatPreviewTime(totalTime)}
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
