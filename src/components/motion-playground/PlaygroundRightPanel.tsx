import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  PLAYGROUND_TEST_SCENARIOS,
  getWave1RecommendedScenarios,
  isWave1RecommendedScenario,
} from "@/config/motion-playground/test-scenarios";
import {
  MOTION_BLOCK_STATUS_LABELS,
  validateMotionBlock,
} from "@/lib/motion-block-library";
import { cn } from "@/lib/utils";
import type {
  MotionAspectRatio,
  MotionBlockLibraryEntry,
  MotionBlockStatus,
  PlaygroundDebugLayer,
  PlaygroundTestScenario,
} from "@/types/motion-block-library";
import type { BrandPreset } from "@/types";
import { AlertTriangle } from "lucide-react";

type PlaygroundRightPanelProps = {
  block: MotionBlockLibraryEntry;
  brand: BrandPreset;
  scenario: PlaygroundTestScenario;
  aspectRatio: MotionAspectRatio;
  content: Record<string, string>;
  warnings: ReturnType<typeof validateMotionBlock>;
  libraryVisibilityWarning: string | null;
  debugLayers: PlaygroundDebugLayer[];
  onScenarioChange: (scenario: PlaygroundTestScenario) => void;
  onContentChange: (slotId: string, value: string) => void;
  onToggleDebugLayer: (layer: PlaygroundDebugLayer) => void;
};

const DEBUG_TOGGLES: { id: PlaygroundDebugLayer; label: string }[] = [
  { id: "canvas-bounds", label: "Canvas bounds" },
  { id: "hard-safe", label: "Hard safe area" },
  { id: "soft-safe", label: "Soft safe area" },
  { id: "vertical-danger", label: "Vertical danger zones" },
  { id: "slot-labels", label: "Slot boxes" },
  { id: "motion-paths", label: "Motion paths" },
  { id: "anchor-points", label: "Anchor points" },
  { id: "media-crops", label: "Media crop boxes" },
  { id: "responsive-bounds", label: "Responsive bounds" },
  { id: "text-overflow", label: "Text overflow warnings" },
];

export function PlaygroundRightPanel({
  block,
  brand,
  scenario,
  aspectRatio,
  content,
  warnings,
  libraryVisibilityWarning,
  debugLayers,
  onScenarioChange,
  onContentChange,
  onToggleDebugLayer,
}: PlaygroundRightPanelProps) {
  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-3">
      <Accordion type="multiple" defaultValue={["overview", "debug", "validation"]} className="space-y-1">
        <AccordionItem value="overview" className="border-border">
          <AccordionTrigger className="py-2 text-xs">Overview</AccordionTrigger>
          <AccordionContent className="space-y-2 text-xs">
            <p className="text-muted-foreground">{block.description}</p>
            <div className="flex flex-wrap gap-1">
              {block.tags.map((tag) => (
                <span key={tag} className="rounded bg-secondary px-1.5 py-0.5 text-[10px]">
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground">
              Family: {block.family} · Duration: {block.duration}f
            </p>
            <p className="text-[10px] text-muted-foreground">
              Formats: {block.supportedFormats.join(", ")}
            </p>
            {block.editorBlockId ? (
              <p className="text-[10px] text-muted-foreground">
                Editor bridge: {block.editorBlockId}
              </p>
            ) : null}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="slots" className="border-border">
          <AccordionTrigger className="py-2 text-xs">Slots</AccordionTrigger>
          <AccordionContent className="space-y-2">
            {block.slots.map((slot) => (
              <div key={slot.id} className="space-y-0.5">
                <Label className="text-[10px] text-muted-foreground">
                  {slot.label} ({slot.type})
                  {slot.required ? " *" : ""}
                </Label>
                <Textarea
                  value={content[slot.id] ?? ""}
                  onChange={(e) => onContentChange(slot.id, e.target.value)}
                  rows={slot.type === "text" ? 2 : 1}
                  className="text-xs"
                />
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="layout" className="border-border">
          <AccordionTrigger className="py-2 text-xs">Layout</AccordionTrigger>
          <AccordionContent className="space-y-1 text-[10px] text-muted-foreground">
            <p>Primitive: {block.layoutRules[aspectRatio]?.mediaTreatment ?? "custom"}</p>
            <p>Slots in layout: {block.layoutRules[aspectRatio]?.slots.length ?? 0}</p>
            <p>Hard safe: {block.safeAreas.hardSafe ? "yes" : "no"}</p>
            <p>Soft safe: {block.safeAreas.softSafe ? "yes" : "no"}</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="motion" className="border-border">
          <AccordionTrigger className="py-2 text-xs">Motion</AccordionTrigger>
          <AccordionContent className="space-y-1 text-[10px] text-muted-foreground">
            <p>In: {block.motionPreset.phases.in}</p>
            <p>Main: {block.motionPreset.phases.main}</p>
            <p>Out: {block.motionPreset.phases.out}</p>
            <p>Easing: {block.motionPreset.easingId}</p>
            <p>Stagger: {block.motionPreset.stagger}f</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="style" className="border-border">
          <AccordionTrigger className="py-2 text-xs">Style</AccordionTrigger>
          <AccordionContent className="space-y-1 text-[10px] text-muted-foreground">
            <p>Align: {block.stylePreset.textAlign ?? "default"}</p>
            <p>Emphasis: {block.stylePreset.emphasis ?? "standard"}</p>
            <p>Brand: {brand.name}</p>
            <Label className="text-[10px]">Test scenario</Label>
            {getWave1RecommendedScenarios(block.id).length > 1 ? (
              <p className="text-[9px] text-muted-foreground">
                Recommended: {getWave1RecommendedScenarios(block.id).join(", ")}
              </p>
            ) : null}
            <select
              value={scenario}
              onChange={(e) => onScenarioChange(e.target.value as PlaygroundTestScenario)}
              className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs"
            >
              {PLAYGROUND_TEST_SCENARIOS.map((s) => (
                <option key={s.id} value={s.id}>
                  {isWave1RecommendedScenario(block.id, s.id) ? "★ " : ""}
                  {s.label}
                </option>
              ))}
            </select>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="fallbacks" className="border-border">
          <AccordionTrigger className="py-2 text-xs">Fallbacks</AccordionTrigger>
          <AccordionContent className="space-y-1 text-[10px] text-muted-foreground">
            <p>Missing media: {block.fallbackRules.missingMedia ?? "—"}</p>
            <p>Missing logo: {block.fallbackRules.missingLogo ?? "—"}</p>
            <p>Missing text: {block.fallbackRules.missingText ?? "—"}</p>
            <p>Long text: {block.fallbackRules.longText ?? "—"}</p>
            <p>Bad crop: {block.fallbackRules.badCrop ?? "—"}</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="debug" className="border-border">
          <AccordionTrigger className="py-2 text-xs">Debug</AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-1">
              {DEBUG_TOGGLES.map((layer) => (
                <button
                  key={layer.id}
                  type="button"
                  onClick={() => onToggleDebugLayer(layer.id)}
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[9px] transition-colors",
                    debugLayers.includes(layer.id)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground",
                  )}
                >
                  {layer.label}
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="validation" className="border-border">
          <AccordionTrigger className="py-2 text-xs">
            Validation
            {warnings.length > 0 ? (
              <span className="ml-1 text-amber-500">({warnings.length})</span>
            ) : null}
          </AccordionTrigger>
          <AccordionContent className="space-y-2">
            {libraryVisibilityWarning ? (
              <div className="flex gap-1.5 rounded border border-amber-500/30 bg-amber-500/10 px-2 py-1.5 text-[10px] text-amber-700 dark:text-amber-400">
                <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                {libraryVisibilityWarning}
              </div>
            ) : null}
            {warnings.length === 0 && !libraryVisibilityWarning ? (
              <p className="text-[10px] text-muted-foreground">No validation issues.</p>
            ) : (
              <ul className="space-y-1">
                {warnings.map((warning, i) => (
                  <li
                    key={`${warning.code}-${i}`}
                    className={cn(
                      "rounded border px-2 py-1 text-[10px] leading-snug",
                      warning.severity === "error" &&
                        "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400",
                      warning.severity === "warning" &&
                        "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
                      warning.severity === "info" &&
                        "border-border bg-secondary/50 text-muted-foreground",
                    )}
                  >
                    {warning.message}
                  </li>
                ))}
              </ul>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export function statusBadgeClass(status: MotionBlockStatus): string {
  switch (status) {
    case "approved":
      return "bg-emerald-500/15 text-emerald-600";
    case "needs-review":
      return "bg-amber-500/15 text-amber-600";
    case "deprecated":
      return "bg-red-500/15 text-red-600";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export { MOTION_BLOCK_STATUS_LABELS };
