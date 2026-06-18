import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
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
  canApproveBlock,
  getApprovalChecklist,
  getTestMatrixResults,
  MOTION_BLOCK_STATUS_LABELS,
  validateMotionBlock,
  type ApprovalCheckItem,
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
import { AlertTriangle, Check, Copy, Download, X } from "lucide-react";
import { statusBadgeClass } from "@/components/motion-playground/PlaygroundRightPanel";

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

const MATRIX_ASPECTS: MotionAspectRatio[] = ["16:9", "9:16", "1:1"];

type ReviewRightPanelProps = {
  block: MotionBlockLibraryEntry;
  brands: BrandPreset[];
  brand: BrandPreset;
  scenario: PlaygroundTestScenario;
  aspectRatio: MotionAspectRatio;
  content: Record<string, string>;
  warnings: ReturnType<typeof validateMotionBlock>;
  libraryVisibilityWarning: string | null;
  debugLayers: PlaygroundDebugLayer[];
  previewRenderable: boolean;
  productionRendererAvailable: boolean;
  productionRendererSucceeded: boolean;
  usingFallbackRenderer: boolean;
  rendererLabel: string;
  onStatusChange: (status: MotionBlockStatus) => void;
  onApproveForSession: () => void;
  onExportJson: () => void;
  onCopyConfig: () => void;
  onContentChange: (slotId: string, value: string) => void;
  onToggleDebugLayer: (layer: PlaygroundDebugLayer) => void;
};

function ChecklistItem({ item }: { item: ApprovalCheckItem }) {
  return (
    <li className="flex items-start gap-2 text-[10px]">
      {item.passed ? (
        <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
      ) : (
        <X className="mt-0.5 h-3 w-3 shrink-0 text-red-500" />
      )}
      <span className={cn(!item.passed && item.required && "text-foreground", item.passed && "text-muted-foreground")}>
        {item.label}
        {item.detail ? <span className="block text-muted-foreground">{item.detail}</span> : null}
      </span>
    </li>
  );
}

export function ReviewRightPanel({
  block,
  brands,
  brand,
  scenario,
  aspectRatio,
  content,
  warnings,
  libraryVisibilityWarning,
  debugLayers,
  previewRenderable,
  productionRendererAvailable,
  productionRendererSucceeded,
  usingFallbackRenderer,
  rendererLabel,
  onStatusChange,
  onApproveForSession,
  onExportJson,
  onCopyConfig,
  onContentChange,
  onToggleDebugLayer,
}: ReviewRightPanelProps) {
  const checklist = getApprovalChecklist({
    block,
    aspectRatio,
    warnings,
    previewRenderable,
    productionRendererAvailable,
    productionRendererSucceeded,
    usingFallbackRenderer,
  });

  const canApprove = canApproveBlock(checklist);
  const criticalWarnings = warnings.filter((w) => w.severity === "error");

  const matrix = getTestMatrixResults(block, brands, MATRIX_ASPECTS, (b, ar, br) =>
    validateMotionBlock(b, ar, content, {}, br, scenario),
  );

  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-3">
      <Accordion type="multiple" defaultValue={["ship", "content"]} className="space-y-1">
        <AccordionItem value="ship" className="border-border">
          <AccordionTrigger className="py-2 text-xs font-semibold">Ship</AccordionTrigger>
          <AccordionContent className="space-y-3">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "rounded px-1.5 py-0.5 text-[9px] font-medium uppercase",
                  statusBadgeClass(block.status),
                )}
              >
                {MOTION_BLOCK_STATUS_LABELS[block.status]}
              </span>
              <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-medium uppercase text-amber-600">
                Session only
              </span>
            </div>

            <Select value={block.status} onValueChange={(v) => onStatusChange(v as MotionBlockStatus)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["draft", "needs-review", "approved", "deprecated"] as const).map((s) => (
                  <SelectItem key={s} value={s}>
                    {MOTION_BLOCK_STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div>
              <Label className="mb-1.5 text-[10px] text-muted-foreground">Approval checklist</Label>
              <ul className="space-y-1">
                {checklist.map((item) => (
                  <ChecklistItem key={item.id} item={item} />
                ))}
              </ul>
            </div>

            {(criticalWarnings.length > 0 || libraryVisibilityWarning) && (
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Validation warnings</Label>
                {libraryVisibilityWarning ? (
                  <div className="flex gap-1.5 rounded border border-amber-500/30 bg-amber-500/10 px-2 py-1.5 text-[10px] text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                    {libraryVisibilityWarning}
                  </div>
                ) : null}
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
              </div>
            )}

            <div>
              <Label className="mb-1.5 text-[10px] text-muted-foreground">Test matrix</Label>
              <div className="overflow-x-auto">
                <table className="w-full text-[9px]">
                  <thead>
                    <tr>
                      <th className="p-1 text-left font-medium text-muted-foreground">Brand</th>
                      {MATRIX_ASPECTS.map((ar) => (
                        <th key={ar} className="p-1 text-center font-medium text-muted-foreground">
                          {ar}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {brands.map((b) => (
                      <tr key={b.id}>
                        <td className="p-1 text-muted-foreground">{b.name.split(" ")[0]}</td>
                        {MATRIX_ASPECTS.map((ar) => {
                          const cell = matrix.find((m) => m.brandId === b.id && m.aspectRatio === ar);
                          return (
                            <td key={ar} className="p-1 text-center">
                              {cell?.ok ? (
                                <Check className="mx-auto h-3 w-3 text-emerald-500" />
                              ) : (
                                <X className="mx-auto h-3 w-3 text-red-400" />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded border border-border bg-secondary/30 px-2 py-1.5 text-[10px] text-muted-foreground">
              Canvas visibility:{" "}
              {block.status === "approved" && !libraryVisibilityWarning
                ? "Will appear in Canvas block drawer"
                : block.status === "approved"
                  ? "Approved but missing metadata for Canvas"
                  : "Not visible until approved"}
            </div>

            <div className="flex flex-wrap gap-1.5">
              <Button
                size="sm"
                className="h-7 flex-1 text-[10px]"
                disabled={!canApprove}
                onClick={onApproveForSession}
                title={canApprove ? undefined : "Complete approval checklist first"}
              >
                Approve for session
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={onCopyConfig}>
                <Copy className="mr-1 h-3 w-3" />
                Copy
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-[10px]" onClick={onExportJson}>
                <Download className="mr-1 h-3 w-3" />
                Export
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="content" className="border-border">
          <AccordionTrigger className="py-2 text-xs">Content</AccordionTrigger>
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

        <AccordionItem value="design" className="border-border">
          <AccordionTrigger className="py-2 text-xs">Design</AccordionTrigger>
          <AccordionContent className="space-y-2 text-[10px] text-muted-foreground">
            <p>Primitive: {block.layoutRules[aspectRatio]?.mediaTreatment ?? "custom"}</p>
            <p>Slots in layout: {block.layoutRules[aspectRatio]?.slots.length ?? 0}</p>
            <p>Align: {block.stylePreset.textAlign ?? "default"}</p>
            <p>Emphasis: {block.stylePreset.emphasis ?? "standard"}</p>
            <p>Hard safe: {block.safeAreas.hardSafe ? "yes" : "no"}</p>
            <p>Soft safe: {block.safeAreas.softSafe ? "yes" : "no"}</p>
            <p>Respect vertical danger: {block.safeAreas.respectVerticalDanger ? "yes" : "no"}</p>
            <p>Brand: {brand.name}</p>
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
            <p>Direction: {block.motionPreset.controls?.direction ?? "—"}</p>
            <p>Intensity: {block.motionPreset.controls?.intensity ?? "—"}</p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="advanced" className="border-border">
          <AccordionTrigger className="py-2 text-xs">Advanced</AccordionTrigger>
          <AccordionContent className="space-y-3">
            <div className="space-y-1 text-[10px] text-muted-foreground">
              <p>Renderer: {rendererLabel}</p>
              <p>Missing media: {block.fallbackRules.missingMedia ?? "—"}</p>
              <p>Missing logo: {block.fallbackRules.missingLogo ?? "—"}</p>
              <p>Long text: {block.fallbackRules.longText ?? "—"}</p>
              {block.editorBlockId ? <p>Editor bridge: {block.editorBlockId}</p> : null}
            </div>

            <div>
              <Label className="mb-1 text-[10px] text-muted-foreground">Debug overlays</Label>
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
            </div>

            <div className="flex gap-1.5">
              <Button variant="outline" size="sm" className="h-7 flex-1 text-[10px]" onClick={onCopyConfig}>
                Copy config
              </Button>
              <Button variant="outline" size="sm" className="h-7 flex-1 text-[10px]" onClick={onExportJson}>
                Export JSON
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
