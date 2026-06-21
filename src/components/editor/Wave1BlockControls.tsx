import { motionBlockMap } from "@/config/blocks";
import { formatContentLabel } from "@/lib/block-motion-utils";
import { cn } from "@/lib/utils";
import type { MotionBlockInstance } from "@/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const WAVE1_BLOCK_IDS = new Set([
  "editorial-statement",
  "big-stat-proof",
  "brand-payoff",
  "hero-split-text-media",
  "centered-ui-feature",
  "hero-prompt-bar",
  "card-collage-dof",
  "template-carousel",
]);

type Wave1BlockControlsProps = {
  block: MotionBlockInstance;
  formatId: string;
  onContentChange: (key: string, value: string) => void;
  onMotionChange: (key: string, value: string | number) => void;
  onLayoutOverride: (patch: Record<string, unknown>) => void;
  className?: string;
};

function BoolToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <Label className="text-[10px] text-muted-foreground">{label}</Label>
      <div className="flex gap-1">
        <Button
          type="button"
          size="sm"
          variant={checked ? "default" : "outline"}
          className="h-6 px-2 text-[10px]"
          onClick={() => onChange(true)}
        >
          On
        </Button>
        <Button
          type="button"
          size="sm"
          variant={!checked ? "default" : "outline"}
          className="h-6 px-2 text-[10px]"
          onClick={() => onChange(false)}
        >
          Off
        </Button>
      </div>
    </div>
  );
}

function parseWords(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

function countCards(content: Record<string, string>): number {
  let count = 0;
  for (let i = 1; i <= 6; i += 1) {
    if (content[`card-${i}-title`]?.trim()) count += 1;
  }
  return count;
}

function countCarouselItems(content: Record<string, string>): number {
  let count = 0;
  for (let i = 1; i <= 5; i += 1) {
    if (content[`item-${i}-title`]?.trim()) count += 1;
  }
  return Math.max(count, 1);
}

export function isWave1Block(blockId: string): boolean {
  return WAVE1_BLOCK_IDS.has(blockId);
}

export function Wave1BlockControls({
  block,
  formatId,
  onContentChange,
  onMotionChange,
  onLayoutOverride,
  className,
}: Wave1BlockControlsProps) {
  if (!isWave1Block(block.blockId)) return null;

  const definition = motionBlockMap[block.blockId];
  if (!definition) return null;

  const content = block.content;
  const controls = block.motion.controls;

  const boolContent = (key: string, defaultValue = false) =>
    (content[key] ?? (defaultValue ? "true" : "false")) === "true";

  const boolControl = (key: string, defaultValue = true) =>
    (controls[key] ?? (defaultValue ? "true" : "false")) !== "false";

  return (
    <div className={cn("space-y-3 border-t border-border pt-3", className)}>
      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        Wave 1 controls
      </p>

      {block.blockId === "editorial-statement" ? (
        <div className="space-y-2">
          <Label className="text-[10px] text-muted-foreground">Accent word</Label>
          <div className="flex flex-wrap gap-1">
            {parseWords(content.headline ?? "").map((word) => (
              <button
                key={word}
                type="button"
                onClick={() => onContentChange("accentWord", word.replace(/[.,!?;:"']/g, ""))}
                className={cn(
                  "rounded px-2 py-0.5 text-[10px]",
                  content.accentWord === word.replace(/[.,!?;:"']/g, "")
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary",
                )}
              >
                {word}
              </button>
            ))}
          </div>
          <BoolToggle
            label="Glow accent"
            checked={boolControl("glowAccent")}
            onChange={(checked) => onMotionChange("glowAccent", checked ? "true" : "false")}
          />
        </div>
      ) : null}

      {block.blockId === "big-stat-proof" ? (
        <div className="space-y-2">
          <BoolToggle
            label="Step rail"
            checked={boolContent("showStepRail")}
            onChange={(checked) => onContentChange("showStepRail", checked ? "true" : "false")}
          />
          <BoolToggle
            label="Count-up stat"
            checked={boolControl("countUp")}
            onChange={(checked) => onMotionChange("countUp", checked ? "true" : "false")}
          />
        </div>
      ) : null}

      {block.blockId === "brand-payoff" ? (
        <BoolToggle
          label="Show URL"
          checked={boolContent("showUrl", true)}
          onChange={(checked) => onContentChange("showUrl", checked ? "true" : "false")}
        />
      ) : null}

      {block.blockId === "hero-split-text-media" ? (
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground">Media side</Label>
          <Select
            value={
              block.layoutOverrides?.formats?.[formatId]?.mediaPosition === "left" ? "left" : "right"
            }
            onValueChange={(side) => onLayoutOverride({ mediaPosition: side })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Text right · media left</SelectItem>
              <SelectItem value="right">Text left · media right</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {block.blockId === "centered-ui-feature" ? (
        <div className="space-y-2">
          <BoolToggle
            label="Step rail"
            checked={boolContent("showStepRail", true)}
            onChange={(checked) => onContentChange("showStepRail", checked ? "true" : "false")}
          />
          <BoolToggle
            label="Type-on input"
            checked={boolControl("typeOn")}
            onChange={(checked) => onMotionChange("typeOn", checked ? "true" : "false")}
          />
        </div>
      ) : null}

      {block.blockId === "hero-prompt-bar" ? (
        <div className="space-y-2">
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Bar position</Label>
            <Select
              value={
                block.layoutOverrides?.formats?.[formatId]?.contentZone === "lower-third"
                  ? "lower-third"
                  : "center"
              }
              onValueChange={(zone) => onLayoutOverride({ contentZone: zone })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="lower-third">Lower third</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <BoolToggle
            label="Type-on prompt"
            checked={boolControl("typeOn")}
            onChange={(checked) => onMotionChange("typeOn", checked ? "true" : "false")}
          />
        </div>
      ) : null}

      {block.blockId === "card-collage-dof" ? (
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground">Hero card</Label>
          <Select
            value={content.heroCardIndex ?? controls.heroCardIndex?.toString() ?? "1"}
            onValueChange={(value) => {
              onContentChange("heroCardIndex", value);
              onMotionChange("heroCardIndex", value);
            }}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: Math.max(countCards(content), 1) }, (_, i) => i + 1).map(
                (index) => (
                  <SelectItem key={index} value={String(index)}>
                    Card {index}
                    {content[`card-${index}-title`]
                      ? ` — ${content[`card-${index}-title`]}`
                      : ""}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {block.blockId === "template-carousel" ? (
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground">Active item</Label>
          <Select
            value={content.activeIndex ?? controls.activeIndex?.toString() ?? "1"}
            onValueChange={(value) => {
              onContentChange("activeIndex", value);
              onMotionChange("activeIndex", value);
            }}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: countCarouselItems(content) }, (_, i) => i + 1).map(
                (index) => (
                  <SelectItem key={index} value={String(index)}>
                    Item {index}
                    {content[`item-${index}-title`]
                      ? ` — ${content[`item-${index}-title`]}`
                      : ""}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      <p className="text-[9px] text-muted-foreground">
        {definition.name}: tier-1 text slots appear above; these are block-specific presets.
      </p>
    </div>
  );
}

export function getWave1ToggleKeys(blockId: string): string[] {
  switch (blockId) {
    case "big-stat-proof":
      return ["showStepRail", "stepLabel"];
    case "brand-payoff":
      return ["showUrl", "url"];
    case "centered-ui-feature":
      return ["showStepRail", "stepLabel", "body"];
    case "editorial-statement":
      return ["subhead", "accentWord"];
    case "hero-split-text-media":
      return ["subhead", "body", "cta"];
    default:
      return [];
  }
}

export function formatWave1ToggleLabel(key: string): string {
  return formatContentLabel(key);
}
