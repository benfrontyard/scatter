import { ExportPanel } from "@/components/editor/ExportPanel";
import { TypographyControls } from "@/components/editor/TypographyControls";
import { EasingPicker } from "@/components/editor/EasingPicker";
import { motionBlockMap } from "@/config/blocks";
import { motionFormats } from "@/config/formats";
import { transitionDefinitions } from "@/config/transitions";
import { useEditor, useSelectedBlock, useSelectedTransition } from "@/context/editor-context";
import {
  formatContentLabel,
  formatMotionControlLabel,
  getMotionControls,
} from "@/lib/block-motion-utils";
import { framesToSeconds, getSequenceDurationInFrames } from "@/lib/sequence-utils";
import { normalizeBrandMotion } from "@/lib/easing";
import { cn } from "@/lib/utils";
import type { MotionBlockInstance, TransitionDirection } from "@/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Film, Layers, Palette, SlidersHorizontal } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

function AssetsSection() {
  const { assets, addAsset, removeAsset } = useEditor();

  return (
    <div className="space-y-2 rounded-md border border-border bg-background/50 p-2.5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">Assets</p>
        <label className="cursor-pointer">
          <span className="sr-only">Upload image asset</span>
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void addAsset(file);
              event.target.value = "";
            }}
          />
          <Button type="button" size="sm" variant="outline" className="h-7 text-xs" asChild>
            <span>Upload</span>
          </Button>
        </label>
      </div>
      {assets.length === 0 ? (
        <p className="py-3 text-center text-xs text-muted-foreground">
          No assets uploaded. Add images to use in blocks.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {assets.map((asset) => (
            <li
              key={asset.id}
              className="flex items-center gap-2 rounded-sm border border-border px-2 py-1.5"
            >
              <img
                src={asset.dataUrl}
                alt={asset.name}
                className="h-8 w-8 shrink-0 rounded object-cover"
              />
              <span className="min-w-0 flex-1 truncate text-xs">{asset.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 shrink-0 text-xs text-muted-foreground hover:text-destructive"
                onClick={() => removeAsset(asset.id)}
                aria-label={`Remove ${asset.name}`}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const MOTION_SELECT_OPTIONS: Record<string, string[]> = {
  direction: ["up", "down", "left", "right"],
  intensity: ["subtle", "standard", "hero"],
  speed: ["calm", "standard", "energetic"],
};

const STYLE_CONTENT_KEYS = new Set(["backgroundColor", "accentColor"]);
const MULTILINE_CONTENT_KEYS = new Set(["subhead", "body", "supportingText"]);

const DIRECTION_OPTIONS: TransitionDirection[] = ["left", "right", "up", "down"];

const FPS_OPTIONS = [24, 30, 60];

type SettingsPanelProps = {
  className?: string;
};

function PanelShell({
  className,
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  className?: string;
  icon: typeof SlidersHorizontal;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <aside
      className={cn(
        "flex w-full shrink-[2] flex-col border-l border-border bg-card md:w-[320px] md:min-w-[240px] md:max-w-[320px]",
        className,
      )}
    >
      <div className="flex shrink-0 items-start gap-2 border-b border-border px-3 py-2.5">
        <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <h2 className="truncate text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-0.5 truncate text-sm font-medium text-foreground">{subtitle}</p>
          ) : null}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </aside>
  );
}

function DurationField({
  id,
  label,
  frames,
  fps,
  minFrames,
  maxFrames,
  onChange,
}: {
  id?: string;
  label?: string;
  frames: number;
  fps: number;
  minFrames: number;
  maxFrames: number;
  onChange: (frames: number) => void;
}) {
  const seconds = framesToSeconds(frames, fps);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        {label ? <Label htmlFor={id}>{label}</Label> : <span />}
        <span className="shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground">
          {seconds}s · {frames}f
        </span>
      </div>
      <Input
        id={id}
        type="number"
        inputMode="decimal"
        step={0.1}
        min={minFrames / fps}
        max={maxFrames / fps}
        value={seconds}
        className="h-8 text-sm"
        onChange={(event) => {
          const nextSeconds = Number.parseFloat(event.target.value);
          if (!Number.isNaN(nextSeconds)) {
            onChange(Math.round(nextSeconds * fps));
          }
        }}
      />
      <Slider
        value={[frames]}
        min={minFrames}
        max={maxFrames}
        step={1}
        onValueChange={([value]) => onChange(value)}
      />
    </div>
  );
}

function ColorField({
  id,
  label,
  value,
  fallback,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  fallback: string;
  onChange: (value: string) => void;
}) {
  const displayValue = value || fallback;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="color"
          value={displayValue}
          onChange={(event) => onChange(event.target.value)}
          className="h-8 w-10 shrink-0 cursor-pointer rounded border border-input bg-background p-0.5"
        />
        <Input
          value={value}
          placeholder={fallback}
          className="h-8 font-mono text-xs"
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </div>
  );
}

function ContentField({
  fieldKey,
  block,
  onChange,
}: {
  fieldKey: string;
  block: MotionBlockInstance;
  onChange: (key: string, value: string) => void;
}) {
  const value = block.content[fieldKey] ?? "";

  if (MULTILINE_CONTENT_KEYS.has(fieldKey)) {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={fieldKey}>{formatContentLabel(fieldKey)}</Label>
        <Textarea
          id={fieldKey}
          value={value}
          className="min-h-[64px] text-sm"
          onChange={(event) => onChange(fieldKey, event.target.value)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor={fieldKey}>{formatContentLabel(fieldKey)}</Label>
      <Input
        id={fieldKey}
        value={value}
        className="h-8 text-sm"
        onChange={(event) => onChange(fieldKey, event.target.value)}
      />
    </div>
  );
}

function MotionControlField({
  controlKey,
  defaultValue,
  currentValue,
  onChange,
}: {
  controlKey: string;
  defaultValue: number | string;
  currentValue: number | string | undefined;
  onChange: (key: string, value: number | string) => void;
}) {
  const selectOptions = MOTION_SELECT_OPTIONS[controlKey];
  const resolvedValue = currentValue ?? defaultValue;

  if (selectOptions) {
    return (
      <div className="space-y-1.5">
        <Label>{formatMotionControlLabel(controlKey)}</Label>
        <Select
          value={String(resolvedValue)}
          onValueChange={(value) => onChange(controlKey, value)}
        >
          <SelectTrigger className="h-8 w-full text-sm capitalize">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {selectOptions.map((option) => (
              <SelectItem key={option} value={option} className="capitalize">
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  const numericDefault = typeof defaultValue === "number" ? defaultValue : 8;
  const numericValue = Number(resolvedValue ?? numericDefault);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label>{formatMotionControlLabel(controlKey)}</Label>
        <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
          {numericValue.toFixed(controlKey === "stagger" ? 0 : 2)}
        </span>
      </div>
      <Slider
        value={[numericValue]}
        min={controlKey === "stagger" ? 2 : 0.5}
        max={
          controlKey.includes("Size") || controlKey.includes("Scale") || controlKey === "emphasis"
            ? 2
            : controlKey === "stagger"
              ? 24
              : 30
        }
        step={controlKey === "stagger" ? 1 : 0.05}
        onValueChange={([value]) => onChange(controlKey, value)}
      />
    </div>
  );
}

function BlockSettings({ className }: { className?: string }) {
  const { brand, fps, updateBlockContent, updateBlockMotion, updateBlockEasing, updateBlockDuration } =
    useEditor();
  const selectedBlock = useSelectedBlock();
  if (!selectedBlock) return null;

  const definition = motionBlockMap[selectedBlock.blockId];
  if (!definition) return null;

  const motion = normalizeBrandMotion(brand.motion);

  const motionControls = getMotionControls(selectedBlock.motion);
  const contentKeys = Object.keys(definition.defaultContent).filter(
    (key) => !STYLE_CONTENT_KEYS.has(key),
  );
  const styleKeys = Object.keys(definition.defaultContent).filter((key) =>
    STYLE_CONTENT_KEYS.has(key),
  );

  return (
    <PanelShell
      className={className}
      icon={SlidersHorizontal}
      title="Block"
      subtitle={definition.name}
    >
      <div className="space-y-3 p-3">
        <DurationField
          id="block-duration"
          label="Duration"
          frames={selectedBlock.duration}
          fps={fps}
          minFrames={30}
          maxFrames={300}
          onChange={(duration) => updateBlockDuration(selectedBlock.id, duration)}
        />

        <Accordion
          type="multiple"
          defaultValue={["content", "motion", "style"]}
          className="rounded-md border border-border px-3"
        >
          {contentKeys.length > 0 ? (
            <AccordionItem value="content" className="border-border">
              <AccordionTrigger className="text-muted-foreground">Content</AccordionTrigger>
              <AccordionContent className="space-y-3">
                {contentKeys.map((key) => (
                  <ContentField
                    key={key}
                    fieldKey={key}
                    block={selectedBlock}
                    onChange={(fieldKey, value) =>
                      updateBlockContent(selectedBlock.id, fieldKey, value)
                    }
                  />
                ))}
              </AccordionContent>
            </AccordionItem>
          ) : null}

          <AccordionItem value="motion" className="border-border">
            <AccordionTrigger className="text-muted-foreground">Motion</AccordionTrigger>
            <AccordionContent className="space-y-3">
              <EasingPicker
                label="Easing"
                value={selectedBlock.motion.easingId}
                onChange={(easingId) => updateBlockEasing(selectedBlock.id, easingId)}
                allowInherit
                inheritLabel="Inherit from brand"
                inheritEasingId={motion.entranceEasingId}
                compact
              />
              {Object.entries(motionControls).map(([key, defaultValue]) => (
                <MotionControlField
                  key={key}
                  controlKey={key}
                  defaultValue={defaultValue}
                  currentValue={selectedBlock.motion.controls[key]}
                  onChange={(motionKey, value) =>
                    updateBlockMotion(selectedBlock.id, motionKey, value)
                  }
                />
              ))}
            </AccordionContent>
          </AccordionItem>

          {styleKeys.length > 0 ? (
            <AccordionItem value="style" className="border-border">
              <AccordionTrigger className="text-muted-foreground">Style</AccordionTrigger>
              <AccordionContent className="space-y-3">
                {styleKeys.map((key) => (
                  <ColorField
                    key={key}
                    id={key}
                    label={formatContentLabel(key)}
                    value={selectedBlock.content[key] ?? ""}
                    fallback={
                      key === "backgroundColor"
                        ? brand.colors.background
                        : brand.colors.accent
                    }
                    onChange={(value) => updateBlockContent(selectedBlock.id, key, value)}
                  />
                ))}
              </AccordionContent>
            </AccordionItem>
          ) : null}
        </Accordion>
      </div>
    </PanelShell>
  );
}

function TransitionSettings({ className }: { className?: string }) {
  const { brand, fps, updateTransition, updateTransitionDuration } = useEditor();
  const selectedTransition = useSelectedTransition();
  if (!selectedTransition) return null;

  const motion = normalizeBrandMotion(brand.motion);

  const transitionDef = transitionDefinitions.find(
    (definition) => definition.type === selectedTransition.type,
  );

  return (
    <PanelShell
      className={className}
      icon={Layers}
      title="Transition"
      subtitle={transitionDef?.name ?? selectedTransition.type}
    >
      <div className="space-y-3 p-3">
        <div className="space-y-1.5">
          <Label>Transition type</Label>
          <Select
            value={selectedTransition.type}
            onValueChange={(type) =>
              updateTransition(selectedTransition.id, (transition) => ({
                ...transition,
                type: type as typeof transition.type,
              }))
            }
          >
            <SelectTrigger className="h-8 w-full text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {transitionDefinitions.map((definition) => (
                <SelectItem key={definition.id} value={definition.type}>
                  {definition.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DurationField
          id="transition-duration"
          label="Duration"
          frames={selectedTransition.duration}
          fps={fps}
          minFrames={1}
          maxFrames={60}
          onChange={(duration) => updateTransitionDuration(selectedTransition.id, duration)}
        />

        <div className="space-y-1.5">
          <Label>Direction</Label>
          <Select
            value={selectedTransition.direction}
            onValueChange={(direction) =>
              updateTransition(selectedTransition.id, (transition) => ({
                ...transition,
                direction: direction as TransitionDirection,
              }))
            }
          >
            <SelectTrigger className="h-8 w-full text-sm capitalize">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DIRECTION_OPTIONS.map((direction) => (
                <SelectItem key={direction} value={direction} className="capitalize">
                  {direction}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <EasingPicker
          label="Easing"
          value={selectedTransition.easingId}
          onChange={(easingId) =>
            updateTransition(selectedTransition.id, (transition) => ({
              ...transition,
              easingId,
              easing: undefined,
            }))
          }
          allowInherit
          inheritLabel="Inherit from brand"
          inheritEasingId={motion.transitionEasingId}
          compact
        />

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label>Overlap</Label>
            <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
              {Math.round(selectedTransition.overlap * 100)}%
            </span>
          </div>
          <Slider
            value={[selectedTransition.overlap]}
            min={0}
            max={1}
            step={0.05}
            onValueChange={([value]) =>
              updateTransition(selectedTransition.id, (transition) => ({
                ...transition,
                overlap: value,
              }))
            }
          />
        </div>
      </div>
    </PanelShell>
  );
}

function ProjectSettings({ className }: { className?: string }) {
  const {
    brand,
    allBrands,
    format,
    fps,
    sequence,
    setBrand,
    setFormat,
    setFps,
    setProjectTypography,
    setCanvasBackground,
    setShowBrandSettings,
  } = useEditor();
  const sequenceDuration = getSequenceDurationInFrames(sequence);
  const canvasBackground = sequence.canvasBackground ?? "";

  return (
    <PanelShell className={className} icon={Film} title="Project" subtitle={sequence.name}>
      <div className="space-y-3 p-3">
        <div className="space-y-1.5">
          <Label>Aspect ratio</Label>
          <Select value={format.id} onValueChange={setFormat}>
            <SelectTrigger className="h-8 w-full text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {motionFormats.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.label} ({item.aspectRatio})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Brand preset</Label>
          <div className="flex gap-2">
            <Select value={brand.id} onValueChange={setBrand}>
              <SelectTrigger className="h-8 flex-1 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allBrands.map((preset) => (
                  <SelectItem key={preset.id} value={preset.id}>
                    {preset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => setShowBrandSettings(true)}
              aria-label="Customize brand"
              title="Customize brand"
            >
              <Palette className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <TypographyControls
          value={sequence.typography}
          onChange={setProjectTypography}
        />

        <div className="space-y-1.5">
          <Label htmlFor="project-fps">FPS</Label>
          <Select value={String(fps)} onValueChange={(v) => setFps(Number(v))}>
            <SelectTrigger id="project-fps" className="h-8 w-full text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FPS_OPTIONS.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option} fps
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ColorField
          id="canvas-background"
          label="Background"
          value={canvasBackground}
          fallback={brand.colors.background}
          onChange={setCanvasBackground}
        />

        <AssetsSection />

        <div className="rounded-md border border-border bg-background/50 p-2.5">
          <div className="flex items-center justify-between">
            <Label className="text-muted-foreground">Sequence duration</Label>
            <span className="font-mono text-xs tabular-nums">
              {framesToSeconds(sequenceDuration, fps)}s
            </span>
          </div>
          <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
            {sequenceDuration} frames across {sequence.blocks.length} blocks
            {sequence.transitions.length > 0
              ? ` · ${sequence.transitions.length} transitions`
              : ""}
          </p>
        </div>
      </div>
    </PanelShell>
  );
}

export function SettingsPanel({ className }: SettingsPanelProps) {
  const { step } = useEditor();
  const selectedBlock = useSelectedBlock();
  const selectedTransition = useSelectedTransition();

  if (selectedTransition) {
    return <TransitionSettings className={className} />;
  }

  if (selectedBlock) {
    return <BlockSettings className={className} />;
  }

  if (step === "export") {
    return <ExportPanel className={className} />;
  }

  return <ProjectSettings className={className} />;
}
