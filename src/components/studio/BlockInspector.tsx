import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  canApproveBlock,
  getApprovalChecklist,
  getTestMatrixResults,
  isPublishedStatus,
  getBlockPrimaryAction,
  validateMotionBlock,
  normalizeBlockStatus,
  statusBadgeClass,
  MOTION_BLOCK_STATUS_LABELS,
  type ApprovalCheckItem,
} from "@/lib/motion-block-library";
import { cn } from "@/lib/utils";
import type {
  MotionAspectRatio,
  MotionBlockLibraryEntry,
  MotionBlockStatus,
  PlaygroundTestScenario,
} from "@/types/motion-block-library";
import type { BrandPreset } from "@/types";
import { AlertTriangle, Check, Download, X } from "lucide-react";
import { useMemo } from "react";

const MATRIX_ASPECTS: MotionAspectRatio[] = ["16:9", "9:16", "1:1"];

type BlockInspectorProps = {
  block: MotionBlockLibraryEntry;
  brands: BrandPreset[];
  brand: BrandPreset;
  scenario: PlaygroundTestScenario;
  aspectRatio: MotionAspectRatio;
  content: Record<string, string>;
  warnings: ReturnType<typeof import("@/lib/motion-block-library").validateMotionBlock>;
  libraryVisibilityWarning: string | null;
  previewRenderable: boolean;
  productionRendererAvailable: boolean;
  productionRendererSucceeded: boolean;
  usingFallbackRenderer: boolean;
  selectedFailure: string | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onStatusChange: (status: MotionBlockStatus) => void;
  onPrimaryAction: () => void;
  onExportJson: () => void;
  onCopyPatch: () => void;
  onContentChange: (slotId: string, value: string) => void;
  onMatrixCellClick: (brandId: string, aspectRatio: MotionAspectRatio, failure?: string) => void;
};

function ChecklistItem({ item }: { item: ApprovalCheckItem }) {
  return (
    <li className="flex items-start gap-2 text-xs">
      {item.passed ? (
        <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
      ) : (
        <X className="mt-0.5 h-3 w-3 shrink-0 text-red-500" />
      )}
      <span
        className={cn(
          !item.passed && item.required && "text-foreground",
          item.passed && "text-muted-foreground",
        )}
      >
        {item.label}
        {item.detail ? <span className="block text-muted-foreground">{item.detail}</span> : null}
      </span>
    </li>
  );
}

export function BlockInspector({
  block,
  brands,
  brand,
  scenario,
  aspectRatio,
  content,
  warnings,
  libraryVisibilityWarning,
  previewRenderable,
  productionRendererAvailable,
  productionRendererSucceeded,
  usingFallbackRenderer,
  selectedFailure,
  activeTab,
  onTabChange,
  onStatusChange,
  onPrimaryAction,
  onExportJson,
  onCopyPatch,
  onContentChange,
  onMatrixCellClick,
}: BlockInspectorProps) {
  const checklist = useMemo(
    () =>
      getApprovalChecklist({
        block,
        aspectRatio,
        warnings,
        previewRenderable,
        productionRendererAvailable,
        productionRendererSucceeded,
        usingFallbackRenderer,
      }),
    [
      block,
      aspectRatio,
      warnings,
      previewRenderable,
      productionRendererAvailable,
      productionRendererSucceeded,
      usingFallbackRenderer,
    ],
  );

  const matrixResults = useMemo(
    () =>
      getTestMatrixResults(block, brands, MATRIX_ASPECTS, (b, ar, br) =>
        validateMotionBlock(b, ar, content, {}, br, scenario),
      ),
    [block, brands, content, scenario],
  );

  const canAdvance = canApproveBlock(checklist);
  const primaryAction = getBlockPrimaryAction(block.status, canAdvance);
  const normalizedStatus = normalizeBlockStatus(block.status);
  const criticalWarnings = warnings.filter((w) => w.severity === "error");
  const failedRequired = checklist.filter((item) => item.required && !item.passed);
  const matrixFailCount = matrixResults.filter((m) => !m.ok).length;

  const headlineBlocker =
    selectedFailure ??
    criticalWarnings[0]?.message ??
    libraryVisibilityWarning ??
    failedRequired[0]?.detail ??
    failedRequired[0]?.label ??
    null;

  const canvasVisible = isPublishedStatus(block.status) && !libraryVisibilityWarning;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <Tabs value={activeTab} onValueChange={onTabChange} className="flex min-h-0 flex-1 flex-col">
        <TabsList className="mx-2 mt-2 h-9 shrink-0 justify-start gap-0.5 overflow-x-auto bg-transparent p-0">
          {(["review", "content", "brand", "motion", "export"] as const).map((tab) => (
            <TabsTrigger key={tab} value={tab} className="h-8 shrink-0 px-2.5 text-[11px] capitalize">
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent
          value="review"
          className="min-h-0 flex-1 overflow-y-auto px-3 pb-3 data-[state=inactive]:hidden"
        >
          <div className="space-y-3 pt-1">
            {headlineBlocker ? (
              <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-700 dark:text-red-400">
                {headlineBlocker}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No blockers for current preview.</p>
            )}

            <div className="space-y-1.5">
              <Button
                size="sm"
                variant={primaryAction.variant}
                className="h-9 w-full text-xs"
                disabled={
                  primaryAction.action === "status-change" &&
                  primaryAction.nextStatus === "ready-to-publish" &&
                  !canAdvance
                }
                onClick={onPrimaryAction}
              >
                {primaryAction.label}
              </Button>
              <p className="text-[11px] text-muted-foreground">{primaryAction.description}</p>
            </div>

            <Accordion
              type="multiple"
              defaultValue={failedRequired.length > 0 ? ["checklist"] : []}
              className="w-full"
            >
              <AccordionItem value="checklist" className="border-border">
                <AccordionTrigger className="py-2 text-xs">
                  Approval checklist
                  {failedRequired.length > 0 ? (
                    <span className="ml-1 text-red-500">({failedRequired.length} failing)</span>
                  ) : (
                    <span className="ml-1 text-emerald-600">(passed)</span>
                  )}
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-1">
                    {checklist.map((item) => (
                      <ChecklistItem key={item.id} item={item} />
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="matrix" className="border-border">
                <AccordionTrigger className="py-2 text-xs">
                  Brand × format matrix
                  {matrixFailCount > 0 ? (
                    <span className="ml-1 text-red-500">({matrixFailCount} failing)</span>
                  ) : (
                    <span className="ml-1 text-emerald-600">(all pass)</span>
                  )}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="mb-2 text-[11px] text-muted-foreground">
                    Click a failing cell to jump preview to that brand and format.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[11px]">
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
                            <td className="p-1 text-muted-foreground">{b.name}</td>
                            {MATRIX_ASPECTS.map((ar) => {
                              const cell = matrixResults.find(
                                (m) => m.brandId === b.id && m.aspectRatio === ar,
                              );
                              const isActive = brand.id === b.id && aspectRatio === ar;
                              return (
                                <td key={ar} className="p-1 text-center">
                                  <button
                                    type="button"
                                    title={cell?.firstError ?? "Pass"}
                                    onClick={() =>
                                      onMatrixCellClick(
                                        b.id,
                                        ar,
                                        cell?.ok ? undefined : cell?.firstError,
                                      )
                                    }
                                    className={cn(
                                      "mx-auto flex h-6 w-6 items-center justify-center rounded transition-colors",
                                      isActive && "ring-1 ring-primary",
                                      !cell?.ok && "hover:bg-red-500/10",
                                      cell?.ok && "hover:bg-emerald-500/10",
                                    )}
                                  >
                                    {cell?.ok ? (
                                      <Check className="h-3 w-3 text-emerald-500" />
                                    ) : (
                                      <X className="h-3 w-3 text-red-400" />
                                    )}
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {libraryVisibilityWarning && !headlineBlocker?.includes(libraryVisibilityWarning) ? (
              <div className="flex gap-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1.5 text-xs text-amber-700 dark:text-amber-400">
                <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                {libraryVisibilityWarning}
              </div>
            ) : null}

            <p className="text-[11px] text-muted-foreground">
              Canvas:{" "}
              {canvasVisible
                ? "Visible in block drawer"
                : isPublishedStatus(block.status)
                  ? "Published but missing Canvas metadata"
                  : "Hidden until published"}
            </p>

            {isPublishedStatus(block.status) ? (
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-full text-xs"
                onClick={() => onStatusChange("deprecated")}
              >
                Deprecate block
              </Button>
            ) : null}
          </div>
        </TabsContent>

        <TabsContent
          value="content"
          className="min-h-0 flex-1 overflow-y-auto px-3 pb-3 data-[state=inactive]:hidden"
        >
          <div className="space-y-4 pt-1">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Preview slots</Label>
              {block.slots.map((slot) => (
                <div key={slot.id} className="space-y-0.5">
                  <Label className="text-xs text-muted-foreground">
                    {slot.label} ({slot.type})
                    {slot.required ? " *" : ""}
                  </Label>
                  <Textarea
                    value={content[slot.id] ?? ""}
                    onChange={(e) => onContentChange(slot.id, e.target.value)}
                    rows={slot.type === "text" ? 2 : 1}
                    className="border-border/60 bg-background text-xs"
                  />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="brand"
          className="min-h-0 flex-1 overflow-y-auto px-3 pb-3 data-[state=inactive]:hidden"
        >
          <div className="space-y-3 pt-1">
            <div className="rounded-md border border-border bg-background p-3">
              <p className="text-xs font-medium">{brand.name}</p>
              <p className="text-[11px] text-muted-foreground">Active preview brand</p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Colors</Label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(brand.colors).slice(0, 6).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-1.5 text-[11px]">
                    <span
                      className="h-5 w-5 rounded border border-border"
                      style={{ backgroundColor: value }}
                    />
                    <span className="text-muted-foreground">{key}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1 text-xs text-muted-foreground">
              <p>Heading: {brand.typography.fontFamilies.heading}</p>
              <p>Body: {brand.typography.fontFamilies.body}</p>
              {brand.typography.fontFamilies.accent ? (
                <p>Accent: {brand.typography.fontFamilies.accent}</p>
              ) : null}
            </div>

            {warnings.filter((w) => w.message.toLowerCase().includes("brand")).length > 0 ? (
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Brand fit checks</Label>
                {warnings
                  .filter((w) => w.message.toLowerCase().includes("brand"))
                  .map((w) => (
                    <p key={w.message} className="text-[11px] text-amber-700 dark:text-amber-400">
                      {w.message}
                    </p>
                  ))}
              </div>
            ) : (
              <p className="text-[11px] text-emerald-600">Brand fit checks pass for current preview.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent
          value="motion"
          className="min-h-0 flex-1 overflow-y-auto px-3 pb-3 data-[state=inactive]:hidden"
        >
          <div className="space-y-3 pt-1 text-xs text-muted-foreground">
            <div className="rounded-md border border-border bg-background p-3 space-y-1">
              <p className="text-xs font-medium text-foreground">Phases</p>
              <p>In: {block.motionPreset.phases.in}</p>
              <p>Main: {block.motionPreset.phases.main}</p>
              <p>Out: {block.motionPreset.phases.out}</p>
            </div>
            <div className="rounded-md border border-border bg-background p-3 space-y-1">
              <p className="text-xs font-medium text-foreground">Timing</p>
              <p>Easing: {block.motionPreset.easingId}</p>
              <p>Stagger: {block.motionPreset.stagger}f</p>
            </div>
            <div className="rounded-md border border-border bg-background p-3 space-y-1">
              <p className="text-xs font-medium text-foreground">Layout ({aspectRatio})</p>
              <p>Primitive: {block.layoutRules[aspectRatio]?.mediaTreatment ?? "custom"}</p>
              <p>Slots: {block.layoutRules[aspectRatio]?.slots.length ?? 0}</p>
              <p>Align: {block.stylePreset.textAlign ?? "default"}</p>
              <p>Emphasis: {block.stylePreset.emphasis ?? "standard"}</p>
              <p>Hard safe: {block.safeAreas.hardSafe ? "yes" : "no"}</p>
              <p>Soft safe: {block.safeAreas.softSafe ? "yes" : "no"}</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="export"
          className="min-h-0 flex-1 overflow-y-auto px-3 pb-3 data-[state=inactive]:hidden"
        >
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "rounded px-1.5 py-0.5 text-[10px] font-medium uppercase",
                  statusBadgeClass(block.status),
                )}
              >
                {MOTION_BLOCK_STATUS_LABELS[block.status]}
              </span>
              <span className="text-[11px] text-muted-foreground">Session-only until merged</span>
            </div>

            <div className="space-y-1.5">
              <Button variant="default" size="sm" className="h-9 w-full text-xs" onClick={onCopyPatch}>
                Copy blocks.ts patch
              </Button>
              <Button variant="outline" size="sm" className="h-9 w-full text-xs" onClick={onExportJson}>
                <Download className="mr-1 h-3 w-3" />
                Export block JSON
              </Button>
            </div>

            <p className="text-[11px] text-muted-foreground">
              Copy the patch or export JSON, then merge into{" "}
              <code className="rounded bg-muted px-1 font-mono">blocks.ts</code> manually.
            </p>

            {normalizedStatus === "ready-to-publish" ? (
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-full text-xs"
                onClick={() => onStatusChange("published")}
              >
                Mark as Published (session)
              </Button>
            ) : null}
            {isPublishedStatus(block.status) ? (
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-full text-xs"
                onClick={() => onStatusChange("draft")}
              >
                New version (draft)
              </Button>
            ) : null}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
