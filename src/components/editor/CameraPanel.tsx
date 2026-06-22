import { cameraPresets } from "@/config/camera/presets";
import { useEditor } from "@/context/editor-context";
import { focusCameraOnBlock } from "@/lib/camera";
import { cn } from "@/lib/utils";
import type { CameraSettings, FocalLength, LensPreset } from "@/types/camera";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { EasingPicker } from "@/components/editor/EasingPicker";
import { Camera, Crosshair } from "lucide-react";
import type { ReactNode } from "react";

type CameraPanelProps = {
  className?: string;
};

const LENS_OPTIONS: { value: LensPreset; label: string }[] = [
  { value: "wide", label: "Wide" },
  { value: "natural", label: "Natural" },
  { value: "portrait", label: "Portrait" },
  { value: "telephoto", label: "Telephoto" },
  { value: "macro", label: "Macro / Detail" },
];

const FOCAL_LENGTHS: FocalLength[] = [24, 35, 50, 85, 100];

function PanelShell({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <aside
      className={cn("flex h-full w-full min-w-0 flex-col border-l border-border bg-card", className)}
    >
      <div className="flex shrink-0 items-start gap-2 border-b border-border px-3 py-2.5">
        <Camera className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <h2 className="truncate text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Camera
          </h2>
          <p className="mt-0.5 truncate text-sm font-medium text-foreground">
            Composition camera
          </p>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </aside>
  );
}

function PresetPreview({ presetId, gradient }: { presetId: string; gradient: string }) {
  const animationClass: Record<string, string> = {
    "slow-push-in": "animate-camera-push-in",
    "pull-back-reveal": "animate-camera-pull-back",
    "focus-shift": "animate-camera-focus-shift",
    "orbit-subtle": "animate-camera-orbit",
    "parallax-sweep": "animate-camera-parallax",
  };

  return (
    <div
      className="relative h-12 w-full overflow-hidden rounded-md border border-border/60"
      style={{ background: gradient }}
    >
      <div
        className={cn(
          "absolute inset-2 rounded-sm bg-white/20 backdrop-blur-[1px]",
          animationClass[presetId],
        )}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
    </div>
  );
}

function PresetCard({
  name,
  description,
  presetId,
  gradient,
  selected,
  onSelect,
}: {
  name: string;
  description: string;
  presetId: string;
  gradient: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-lg border p-2.5 text-left transition-colors",
        selected
          ? "border-primary bg-primary/5 ring-1 ring-primary/30"
          : "border-border bg-background/50 hover:border-primary/40 hover:bg-muted/30",
      )}
    >
      <PresetPreview presetId={presetId} gradient={gradient} />
      <p className="mt-2 text-xs font-medium text-foreground">{name}</p>
      <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">{description}</p>
    </button>
  );
}

function AxisSlider({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs">{label}</Label>
        <span className="font-mono text-[10px] tabular-nums text-muted-foreground">{value}</span>
      </div>
      <Slider value={[value]} min={min} max={max} step={1} onValueChange={([next]) => onChange(next)} />
    </div>
  );
}

export function CameraPanel({ className }: CameraPanelProps) {
  const {
    camera,
    sequence,
    selectedBlockId,
    updateCamera,
    applyCameraPreset: applyPreset,
    focusCameraOnSelectedBlock,
  } = useEditor();

  const updateSettings = (updater: (current: CameraSettings) => CameraSettings) => {
    updateCamera(updater(camera));
  };

  const focusTargetBlocks = sequence.blocks.filter(
    (block) => block.block3D?.canBeFocusTarget !== false,
  );

  return (
    <PanelShell className={className}>
      <div className="space-y-4 p-3">
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Enable camera</Label>
          <Button
            type="button"
            size="sm"
            variant={camera.enabled ? "default" : "outline"}
            className="ml-auto h-7 shrink-0 px-2.5 text-[10px]"
            onClick={() => updateSettings((current) => ({ ...current, enabled: !current.enabled }))}
          >
            {camera.enabled ? "On" : "Off"}
          </Button>
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] text-muted-foreground">Camera presets</Label>
          <div className="grid grid-cols-1 gap-2">
            {cameraPresets.map((preset) => (
              <PresetCard
                key={preset.id}
                presetId={preset.id}
                name={preset.name}
                description={preset.description}
                gradient={preset.previewGradient}
                selected={camera.presetId === preset.id}
                onSelect={() => applyPreset(preset.id)}
              />
            ))}
          </div>
          {camera.presetId ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 w-full text-[10px] text-muted-foreground"
              onClick={() =>
                updateSettings((current) => ({
                  ...current,
                  presetId: undefined,
                  enabled: false,
                }))
              }
            >
              Clear preset
            </Button>
          ) : null}
        </div>

        <div className="space-y-3 rounded-md border border-border bg-background/50 p-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Timing
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Duration</Label>
              <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                {Math.round((camera.durationRatio ?? 1) * 100)}%
              </span>
            </div>
            <Slider
              value={[Math.round((camera.durationRatio ?? 1) * 100)]}
              min={20}
              max={100}
              step={5}
              onValueChange={([value]) =>
                updateSettings((current) => ({ ...current, durationRatio: value / 100 }))
              }
            />
          </div>
          <EasingPicker
            label="Ease"
            value={camera.motion?.easingId}
            onChange={(easingId) =>
              updateSettings((current) => ({
                ...current,
                motion: { ...current.motion, easingId },
              }))
            }
            compact
          />
        </div>

        <div className="space-y-2 rounded-md border border-border bg-background/50 p-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Focus target
          </p>
          <Select
            value={camera.depthOfField?.focusTargetBlockId ?? "none"}
            onValueChange={(value) =>
              updateSettings((current) =>
                value === "none"
                  ? focusCameraOnBlock(current, "")
                  : focusCameraOnBlock(current, value),
              )
            }
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select scene…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {focusTargetBlocks.map((block, index) => (
                <SelectItem key={block.id} value={block.id}>
                  Scene {index + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedBlockId ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 w-full text-[10px]"
              onClick={focusCameraOnSelectedBlock}
            >
              <Crosshair className="mr-1 h-3 w-3" />
              Focus on selected block
            </Button>
          ) : null}
        </div>

        <div className="space-y-3 rounded-md border border-border bg-background/50 p-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Lens
          </p>
          <div className="space-y-1.5">
            <Label className="text-xs">Lens preset</Label>
            <Select
              value={camera.lensPreset ?? "natural"}
              onValueChange={(value) =>
                updateSettings((current) => ({
                  ...current,
                  lensPreset: value as LensPreset,
                }))
              }
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LENS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Focal length</Label>
            <Select
              value={String(camera.focalLength ?? 50)}
              onValueChange={(value) =>
                updateSettings((current) => ({
                  ...current,
                  focalLength: Number(value) as FocalLength,
                }))
              }
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FOCAL_LENGTHS.map((mm) => (
                  <SelectItem key={mm} value={String(mm)}>
                    {mm}mm
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <AxisSlider
            label="Perspective strength"
            value={camera.perspectiveStrength ?? 50}
            min={0}
            max={100}
            onChange={(value) =>
              updateSettings((current) => ({ ...current, perspectiveStrength: value }))
            }
          />
          <AxisSlider
            label="Zoom"
            value={Math.round((camera.zoom ?? 1) * 100)}
            min={50}
            max={150}
            onChange={(value) =>
              updateSettings((current) => ({ ...current, zoom: value / 100 }))
            }
          />
        </div>

        <Accordion type="single" collapsible className="rounded-md border border-border px-3">
          <AccordionItem value="advanced" className="border-border">
            <AccordionTrigger className="text-muted-foreground">Advanced</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  Position
                </p>
                <AxisSlider
                  label="X"
                  value={camera.position?.x ?? 0}
                  min={-100}
                  max={100}
                  onChange={(value) =>
                    updateSettings((current) => ({
                      ...current,
                      position: { ...current.position!, x: value },
                    }))
                  }
                />
                <AxisSlider
                  label="Y"
                  value={camera.position?.y ?? 0}
                  min={-100}
                  max={100}
                  onChange={(value) =>
                    updateSettings((current) => ({
                      ...current,
                      position: { ...current.position!, y: value },
                    }))
                  }
                />
                <AxisSlider
                  label="Z"
                  value={camera.position?.z ?? 0}
                  min={-150}
                  max={150}
                  onChange={(value) =>
                    updateSettings((current) => ({
                      ...current,
                      position: { ...current.position!, z: value },
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  Rotation
                </p>
                <AxisSlider
                  label="Tilt X"
                  value={camera.rotation?.x ?? 0}
                  min={-15}
                  max={15}
                  onChange={(value) =>
                    updateSettings((current) => ({
                      ...current,
                      rotation: { ...current.rotation!, x: value },
                    }))
                  }
                />
                <AxisSlider
                  label="Pan Y"
                  value={camera.rotation?.y ?? 0}
                  min={-15}
                  max={15}
                  onChange={(value) =>
                    updateSettings((current) => ({
                      ...current,
                      rotation: { ...current.rotation!, y: value },
                    }))
                  }
                />
                <AxisSlider
                  label="Roll Z"
                  value={camera.rotation?.z ?? 0}
                  min={-10}
                  max={10}
                  onChange={(value) =>
                    updateSettings((current) => ({
                      ...current,
                      rotation: { ...current.rotation!, z: value },
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    Depth of field
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant={camera.depthOfField?.enabled ? "default" : "outline"}
                    className="h-6 text-[10px]"
                    onClick={() =>
                      updateSettings((current) => ({
                        ...current,
                        depthOfField: {
                          ...current.depthOfField!,
                          enabled: !current.depthOfField?.enabled,
                        },
                      }))
                    }
                  >
                    {camera.depthOfField?.enabled ? "On" : "Off"}
                  </Button>
                </div>
                <AxisSlider
                  label="Blur amount"
                  value={camera.depthOfField?.blurAmount ?? 30}
                  min={0}
                  max={100}
                  onChange={(value) =>
                    updateSettings((current) => ({
                      ...current,
                      depthOfField: { ...current.depthOfField!, blurAmount: value },
                    }))
                  }
                />
                <AxisSlider
                  label="Focus transition speed"
                  value={camera.depthOfField?.transitionSpeed ?? 50}
                  min={0}
                  max={100}
                  onChange={(value) =>
                    updateSettings((current) => ({
                      ...current,
                      depthOfField: { ...current.depthOfField!, transitionSpeed: value },
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  Motion
                </p>
                <AxisSlider
                  label="Subtle camera drift"
                  value={camera.motion?.drift ?? 0}
                  min={0}
                  max={100}
                  onChange={(value) =>
                    updateSettings((current) => ({
                      ...current,
                      motion: { ...current.motion, drift: value },
                    }))
                  }
                />
                <AxisSlider
                  label="Camera shake"
                  value={camera.motion?.shake ?? 0}
                  min={0}
                  max={100}
                  onChange={(value) =>
                    updateSettings((current) => ({
                      ...current,
                      motion: { ...current.motion, shake: value },
                    }))
                  }
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </PanelShell>
  );
}
