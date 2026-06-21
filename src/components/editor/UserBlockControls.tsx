import { motionBlockMap } from "@/config/blocks";
import { useEditor, useSelectedBlock } from "@/context/editor-context";
import { formatContentLabel } from "@/lib/block-motion-utils";
import { cn } from "@/lib/utils";
import type { BlockLayoutIntent } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  getWave1ToggleKeys,
  isWave1Block,
  Wave1BlockControls,
} from "@/components/editor/Wave1BlockControls";
import { RefreshCw } from "lucide-react";
import { useState } from "react";

const MEDIA_CONTENT_KEYS = new Set([
  "image",
  "screenshot",
  "backgroundImage",
  "avatar",
  "media",
  "uiScreenshot",
]);
const STYLE_CONTENT_KEYS = new Set(["backgroundColor", "accentColor"]);
const WAVE1_TOGGLE_KEYS = new Set([
  "showStepRail",
  "showUrl",
  "accentWord",
  "heroCardIndex",
  "activeIndex",
]);

const INTENSITY_MAP = {
  calm: { intensity: "subtle", speed: "calm", stagger: 4 },
  normal: { intensity: "standard", speed: "standard", stagger: 8 },
  energetic: { intensity: "hero", speed: "fast", stagger: 12 },
} as const;

const LAYOUT_INTENTS: Record<string, BlockLayoutIntent> = {
  default: "product-feature",
  compact: "statement",
  hero: "hero",
};

type UserBlockControlsProps = {
  className?: string;
};

export function UserBlockControls({ className }: UserBlockControlsProps) {
  const {
    format,
    updateBlockContent,
    updateBlockMotion,
    updateBlock,
    replaceBlockAsset,
    addAsset,
    showToast,
  } = useEditor();
  const selectedBlock = useSelectedBlock();
  const [layoutVariation, setLayoutVariation] = useState("default");
  const [motionIntensity, setMotionIntensity] = useState<"calm" | "normal" | "energetic">("normal");
  const [hiddenSlots, setHiddenSlots] = useState<Set<string>>(new Set());
  const [focalX, setFocalX] = useState(50);
  const [focalY, setFocalY] = useState(50);

  if (!selectedBlock) return null;

  const definition = motionBlockMap[selectedBlock.blockId];
  if (!definition) return null;

  const textKeys = Object.keys(definition.defaultContent).filter(
    (key) =>
      !STYLE_CONTENT_KEYS.has(key) &&
      !MEDIA_CONTENT_KEYS.has(key) &&
      !WAVE1_TOGGLE_KEYS.has(key) &&
      typeof definition.defaultContent[key] === "string",
  );
  const optionalToggleKeys = isWave1Block(selectedBlock.blockId)
    ? getWave1ToggleKeys(selectedBlock.blockId)
    : textKeys.slice(1);
  const mediaKeys = Object.keys(definition.defaultContent).filter((key) =>
    MEDIA_CONTENT_KEYS.has(key),
  );

  const applyIntensity = (level: "calm" | "normal" | "energetic") => {
    setMotionIntensity(level);
    const preset = INTENSITY_MAP[level];
    updateBlockMotion(selectedBlock.id, "intensity", preset.intensity);
    updateBlockMotion(selectedBlock.id, "speed", preset.speed);
    updateBlockMotion(selectedBlock.id, "stagger", preset.stagger);
  };

  const applyLayoutVariation = (variation: string) => {
    setLayoutVariation(variation);
    updateBlock(selectedBlock.id, (block) => ({
      ...block,
      layoutIntent: LAYOUT_INTENTS[variation] ?? block.layoutIntent,
    }));
  };

  const applyFocalPoint = (x: number, y: number) => {
    const mediaPosition: import("@/types").MediaPosition =
      x < 40 ? "left" : x > 60 ? "right" : y < 40 ? "top" : y > 60 ? "bottom" : "inline";
    updateBlock(selectedBlock.id, (block) => ({
      ...block,
      layoutOverrides: {
        formats: {
          ...block.layoutOverrides?.formats,
          [format.id]: {
            ...block.layoutOverrides?.formats?.[format.id],
            mediaPosition,
          },
        },
      },
    }));
  };

  return (
    <div className={cn("space-y-4 p-3", className)}>
      {textKeys.map((key) => (
        <div key={key} className="space-y-1">
          <Label className="text-[10px] text-muted-foreground">{formatContentLabel(key)}</Label>
          {hiddenSlots.has(key) ? null : (
            <Textarea
              value={selectedBlock.content[key] ?? ""}
              onChange={(e) => updateBlockContent(selectedBlock.id, key, e.target.value)}
              rows={key.includes("headline") || key === "message" ? 2 : 1}
              className="text-xs"
            />
          )}
        </div>
      ))}

      {mediaKeys.map((key) => (
        <div key={key} className="space-y-1">
          <Label className="text-[10px] text-muted-foreground">{formatContentLabel(key)}</Label>
          <label className="block">
            <span className="sr-only">Upload {key}</span>
            <input
              type="file"
              accept="image/*,video/*"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                void addAsset(file).then((asset) => {
                  if (asset) replaceBlockAsset(selectedBlock.id, key, asset.id);
                });
                event.target.value = "";
              }}
            />
            <Button type="button" size="sm" variant="outline" className="h-7 w-full text-xs" asChild>
              <span>Replace image/video</span>
            </Button>
          </label>
        </div>
      ))}

      <div className="space-y-1">
        <Label className="text-[10px] text-muted-foreground">Layout variation</Label>
        <Select value={layoutVariation} onValueChange={applyLayoutVariation}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="compact">Compact</SelectItem>
            <SelectItem value="hero">Hero</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-[10px] text-muted-foreground">Crop / focal point</Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[9px] text-muted-foreground">X</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={focalX}
              className="h-7 text-xs"
              onChange={(e) => {
                const x = Number(e.target.value);
                setFocalX(x);
                applyFocalPoint(x, focalY);
              }}
            />
          </div>
          <div>
            <Label className="text-[9px] text-muted-foreground">Y</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={focalY}
              className="h-7 text-xs"
              onChange={(e) => {
                const y = Number(e.target.value);
                setFocalY(y);
                applyFocalPoint(focalX, y);
              }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <Label className="text-[10px] text-muted-foreground">Motion intensity</Label>
        <div className="flex gap-1">
          {(["calm", "normal", "energetic"] as const).map((level) => (
            <Button
              key={level}
              type="button"
              size="sm"
              variant={motionIntensity === level ? "default" : "outline"}
              className="h-7 flex-1 text-[10px] capitalize"
              onClick={() => applyIntensity(level)}
            >
              {level}
            </Button>
          ))}
        </div>
      </div>

      {textKeys.length > 1 || optionalToggleKeys.length > 0 ? (
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground">Optional elements</Label>
          <div className="flex flex-wrap gap-1">
            {optionalToggleKeys.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  const isHidden = hiddenSlots.has(key);
                  setHiddenSlots((prev) => {
                    const next = new Set(prev);
                    if (isHidden) next.delete(key);
                    else next.add(key);
                    return next;
                  });
                  if (key.startsWith("show")) {
                    updateBlockContent(selectedBlock.id, key, isHidden ? "true" : "false");
                  } else if (!isHidden) {
                    updateBlockContent(selectedBlock.id, key, "");
                  }
                }}
                className={cn(
                  "rounded px-2 py-0.5 text-[10px]",
                  hiddenSlots.has(key)
                    ? "bg-muted text-muted-foreground line-through"
                    : "bg-secondary",
                )}
              >
                {formatContentLabel(key)}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <Wave1BlockControls
        block={selectedBlock}
        formatId={format.id}
        onContentChange={(key, value) => updateBlockContent(selectedBlock.id, key, value)}
        onMotionChange={(key, value) => updateBlockMotion(selectedBlock.id, key, value)}
        onLayoutOverride={(patch) =>
          updateBlock(selectedBlock.id, (current) => ({
            ...current,
            layoutOverrides: {
              formats: {
                ...current.layoutOverrides?.formats,
                [format.id]: {
                  ...current.layoutOverrides?.formats?.[format.id],
                  ...patch,
                },
              },
            },
          }))
        }
      />

      <Button
        type="button"
        size="sm"
        variant="outline"
        className="h-8 w-full gap-1.5 text-xs"
        onClick={() => showToast({ message: "Regenerating block content…" })}
      >
        <RefreshCw className="h-3 w-3" />
        Regenerate this block
      </Button>
    </div>
  );
}
