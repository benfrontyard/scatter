import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { formatPreviewTime } from "@/lib/editor-canvas";
import { cn } from "@/lib/utils";
import {
  MoreHorizontal,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
} from "lucide-react";

const PLAYBACK_SPEEDS = [0.25, 0.5, 1, 1.5] as const;

type StudioPlaybackBarProps = {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onRestart: () => void;
  currentFrame: number;
  inFrame: number;
  effectiveOutFrame: number;
  duration: number;
  fps?: number;
  aspectRatio: string;
  brandName: string;
  blockName?: string;
  onSeek: (frame: number) => void;
  showAdvanced: boolean;
  onToggleAdvanced: () => void;
  playbackSpeed: number;
  onPlaybackSpeedChange: (speed: number) => void;
  loop: boolean;
  onLoopToggle: () => void;
  onStepFrame: (delta: number) => void;
  inFrameValue: number;
  onInFrameChange: (frame: number) => void;
  effectiveOutFrameValue: number;
  onOutFrameChange: (frame: number) => void;
};

export function StudioPlaybackBar({
  isPlaying,
  onTogglePlay,
  onRestart,
  currentFrame,
  inFrame,
  effectiveOutFrame,
  duration,
  fps = 30,
  aspectRatio,
  brandName,
  blockName,
  onSeek,
  showAdvanced,
  onToggleAdvanced,
  playbackSpeed,
  onPlaybackSpeedChange,
  loop,
  onLoopToggle,
  onStepFrame,
  inFrameValue,
  onInFrameChange,
  effectiveOutFrameValue,
  onOutFrameChange,
}: StudioPlaybackBarProps) {
  const currentTime = currentFrame / fps;
  const totalTime = duration / fps;

  return (
    <div
      className="shrink-0 border-t border-border bg-card"
    >
      <div className="flex items-center justify-between border-b border-border px-3 py-2 sm:px-4">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Block preview
          </p>
          {blockName ? (
            <p className="truncate text-xs font-medium sm:text-sm">{blockName}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2 text-[10px] text-muted-foreground sm:text-xs">
          <span>{aspectRatio}</span>
          <span>·</span>
          <span>{brandName}</span>
          <span className="font-mono tabular-nums">
            {formatPreviewTime(currentTime)} / {formatPreviewTime(totalTime)}
          </span>
        </div>
      </div>

      <div className="space-y-2 px-3 py-2 sm:px-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={onTogglePlay}>
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={onRestart}>
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
          <Slider
            className="min-w-[120px] flex-1"
            value={[currentFrame]}
            min={inFrame}
            max={effectiveOutFrame}
            step={1}
            onValueChange={([frame]) => onSeek(frame)}
          />
          <span className="font-mono text-xs tabular-nums text-muted-foreground">
            f{currentFrame}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={onToggleAdvanced}
            title="Advanced playback"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
        </div>

        {showAdvanced ? (
          <div className="flex flex-wrap items-center gap-2 border-t border-border/50 pt-2">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onStepFrame(-1)}>
              <SkipBack className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onStepFrame(1)}>
              <SkipForward className="h-3.5 w-3.5" />
            </Button>
            <Select
              value={String(playbackSpeed)}
              onValueChange={(v) => onPlaybackSpeedChange(Number(v))}
            >
              <SelectTrigger className="h-8 w-[80px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLAYBACK_SPEEDS.map((speed) => (
                  <SelectItem key={speed} value={String(speed)}>
                    {speed}x
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={loop ? "default" : "outline"}
              size="sm"
              className={cn("h-8 text-[10px]")}
              onClick={onLoopToggle}
            >
              Loop {loop ? "on" : "off"}
            </Button>
            <label className="flex items-center gap-1 text-[10px] text-muted-foreground">
              In
              <Input
                type="number"
                min={0}
                max={duration - 1}
                value={inFrameValue}
                onChange={(e) => onInFrameChange(Number(e.target.value))}
                className="h-7 w-14 px-1 text-xs"
              />
            </label>
            <label className="flex items-center gap-1 text-[10px] text-muted-foreground">
              Out
              <Input
                type="number"
                min={0}
                max={duration - 1}
                value={effectiveOutFrameValue}
                onChange={(e) => onOutFrameChange(Number(e.target.value))}
                className="h-7 w-14 px-1 text-xs"
              />
            </label>
          </div>
        ) : null}
      </div>
    </div>
  );
}
