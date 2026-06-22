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
import { fakeBrandKits } from "@/data/fakeBrands";
import { useEditor } from "@/context/editor-context";
import { useStudio } from "@/context/studio-context";
import { studioBrandPresets } from "@/lib/brand-motion-kit-adapter";
import {
  MOTION_BLOCK_FAMILIES,
  createDraftBlockFromBuilder,
  getTestMatrixResults,
  validateMotionBlock,
  buildBlockHandoffPackage,
  downloadBlockHandoffPackage,
} from "@/lib/motion-block-library";
import { buildSlotContent } from "@/config/motion-playground/test-scenarios";
import { cn } from "@/lib/utils";
import type {
  MotionAspectRatio,
  MotionBlockLibraryEntry,
  MotionBlockFamily,
} from "@/types/motion-block-library";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { useMemo, useState } from "react";

const FLOW_STEPS = [
  "Starting point",
  "Basics",
  "Slots",
  "Layout",
  "Motion",
  "Test",
  "Save",
] as const;

const STARTING_POINTS = [
  { id: "blank", label: "Blank", description: "Empty draft block" },
  { id: "duplicate", label: "Duplicate existing", description: "Copy a library block" },
  { id: "layout", label: "Layout primitive", description: "Start from a layout pattern" },
  { id: "brand-preset", label: "Brand motion preset", description: "Seed motion from a demo kit" },
  { id: "import", label: "Import JSON", description: "Paste an existing block config" },
] as const;

const LAYOUT_PRIMITIVES = [
  "Full bleed",
  "Centered",
  "Split",
  "Grid",
  "Stack",
  "Collage",
  "Overlay",
  "Logo lockup",
] as const;

const SLOT_TYPES = [
  "Headline",
  "Subhead",
  "Image",
  "Video",
  "Logo",
  "CTA",
  "Chart",
] as const;

const MOTION_PRESETS = [
  "Fade up",
  "Slide in",
  "Scale in",
  "Stagger",
  "Mask reveal",
] as const;

const FORMAT_OPTIONS: MotionAspectRatio[] = ["16:9", "9:16", "1:1", "4:5"];

type StartingPoint = (typeof STARTING_POINTS)[number]["id"];

type NewBlockFlowProps = {
  onCancel: () => void;
  onComplete: (blockId: string) => void;
};

export function NewBlockFlow({ onCancel, onComplete }: NewBlockFlowProps) {
  const { showToast } = useEditor();
  const { blocks, addBlock } = useStudio();

  const [step, setStep] = useState(0);
  const [startingPoint, setStartingPoint] = useState<StartingPoint>("blank");
  const [duplicateId, setDuplicateId] = useState(blocks[0]?.id ?? "");
  const [importJson, setImportJson] = useState("");
  const [brandPresetKit, setBrandPresetKit] = useState(fakeBrandKits[0].name);

  const [blockName, setBlockName] = useState("");
  const [family, setFamily] = useState<MotionBlockFamily>("image-video");
  const [tags, setTags] = useState("");
  const [intendedUse, setIntendedUse] = useState("");
  const [supportedFormats, setSupportedFormats] = useState<MotionAspectRatio[]>([
    "16:9",
    "9:16",
    "1:1",
  ]);

  const [selectedSlots, setSelectedSlots] = useState<string[]>(["Headline"]);
  const [primitive, setPrimitive] = useState<string>(LAYOUT_PRIMITIVES[0]);
  const [motionPreset, setMotionPreset] = useState<string>(MOTION_PRESETS[0]);

  const draftPreview = useMemo((): MotionBlockLibraryEntry | null => {
    try {
      if (startingPoint === "import" && importJson.trim()) {
        return JSON.parse(importJson) as MotionBlockLibraryEntry;
      }
    } catch {
      return null;
    }

    if (startingPoint === "duplicate" && duplicateId) {
      const source = blocks.find((b) => b.id === duplicateId);
      if (source) {
        return {
          ...structuredClone(source),
          id: `draft-${source.id}-${Date.now()}`,
          name: blockName || `${source.name} (copy)`,
          status: "draft",
        };
      }
    }

    const draft = createDraftBlockFromBuilder({
      name: blockName || "Untitled Block",
      family,
      primitive,
      slotLabels: selectedSlots,
    });

    draft.tags = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    draft.useCases = intendedUse
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    draft.supportedFormats = supportedFormats;

    if (startingPoint === "brand-preset") {
      const kit = fakeBrandKits.find((k) => k.name === brandPresetKit);
      if (kit) {
        draft.motionPreset.easingId = kit.motionKit.easing.default.includes("cubic")
          ? "ease-out"
          : draft.motionPreset.easingId;
        draft.debugMetadata = {
          ...draft.debugMetadata,
          notes: `Seeded from ${kit.name} motion kit`,
        };
      }
    }

    return draft;
  }, [
    startingPoint,
    importJson,
    duplicateId,
    blocks,
    blockName,
    family,
    primitive,
    selectedSlots,
    tags,
    intendedUse,
    supportedFormats,
    brandPresetKit,
  ]);

  const testMatrix = useMemo(() => {
    if (!draftPreview) return [];
    const content = buildSlotContent(
      draftPreview.id,
      "default",
      studioBrandPresets[0]?.logos.textFallback ?? "BRAND",
    );
    return getTestMatrixResults(draftPreview, studioBrandPresets, ["16:9", "9:16", "1:1"], (b, ar, br) =>
      validateMotionBlock(b, ar, content, {}, br, "default"),
    );
  }, [draftPreview]);

  const matrixPassCount = testMatrix.filter((c) => c.ok).length;
  const importValid = startingPoint !== "import" || Boolean(draftPreview);

  const toggleSlot = (slot: string) => {
    setSelectedSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot],
    );
  };

  const toggleFormat = (format: MotionAspectRatio) => {
    setSupportedFormats((prev) =>
      prev.includes(format) ? prev.filter((f) => f !== format) : [...prev, format],
    );
  };

  const finalizeBlock = (status: MotionBlockLibraryEntry["status"]): MotionBlockLibraryEntry | null => {
    if (!draftPreview) return null;
    return { ...draftPreview, status };
  };

  const handleSaveDraft = () => {
    const block = finalizeBlock("draft");
    if (!block) {
      showToast({ message: "Could not create block — check import JSON or required fields." });
      return;
    }
    addBlock(block);
    showToast({ message: `"${block.name}" saved as draft.` });
    onComplete(block.id);
  };

  const handleSendToReview = () => {
    const block = finalizeBlock("candidate");
    if (!block) return;
    addBlock(block);
    showToast({ message: `"${block.name}" sent to review as candidate.` });
    onComplete(block.id);
  };

  const handleExportForDeveloper = () => {
    const block = finalizeBlock("ready-to-publish");
    if (!block) return;
    const pkg = buildBlockHandoffPackage({ block, checklist: [], mode: "review" });
    downloadBlockHandoffPackage(pkg);
    showToast({ message: "Developer handoff package downloaded." });
  };

  const canProceedFromStart =
    startingPoint !== "import" || importValid;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-9 shrink-0 items-center gap-2 border-b border-border px-3">
        <Button variant="ghost" size="sm" className="h-7 gap-1 text-[10px]" onClick={onCancel}>
          <ArrowLeft className="h-3 w-3" />
          Cancel
        </Button>
        <span className="text-xs font-medium">New Block</span>
        <span className="text-[10px] text-muted-foreground">
          Step {step + 1} of {FLOW_STEPS.length}
        </span>
      </div>

      <div className="flex min-h-0 flex-1">
        <aside className="w-52 shrink-0 border-r border-border p-3">
          <ol className="space-y-1">
            {FLOW_STEPS.map((label, i) => (
              <li key={label}>
                <button
                  type="button"
                  onClick={() => setStep(i)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[11px] transition-colors",
                    step === i
                      ? "bg-secondary font-medium text-foreground"
                      : "text-muted-foreground hover:bg-secondary/50",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px]",
                      i < step ? "bg-emerald-500 text-white" : "bg-muted",
                    )}
                  >
                    {i < step ? <Check className="h-2.5 w-2.5" /> : i + 1}
                  </span>
                  {label}
                </button>
              </li>
            ))}
          </ol>
        </aside>

        <main className="min-w-0 flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-lg space-y-4">
            <h2 className="text-lg font-semibold">{FLOW_STEPS[step]}</h2>

            {step === 0 ? (
              <div className="space-y-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  {STARTING_POINTS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setStartingPoint(option.id)}
                      className={cn(
                        "rounded-lg border px-3 py-2.5 text-left transition-colors",
                        startingPoint === option.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-secondary/50",
                      )}
                    >
                      <span className="block text-xs font-medium">{option.label}</span>
                      <span className="mt-0.5 block text-[10px] text-muted-foreground">
                        {option.description}
                      </span>
                    </button>
                  ))}
                </div>

                {startingPoint === "duplicate" ? (
                  <div className="space-y-1">
                    <Label className="text-xs">Source block</Label>
                    <Select value={duplicateId} onValueChange={setDuplicateId}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {blocks.map((b) => (
                          <SelectItem key={b.id} value={b.id}>
                            {b.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}

                {startingPoint === "brand-preset" ? (
                  <div className="space-y-1">
                    <Label className="text-xs">Brand motion kit</Label>
                    <Select value={brandPresetKit} onValueChange={setBrandPresetKit}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fakeBrandKits.map((k) => (
                          <SelectItem key={k.name} value={k.name}>
                            {k.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}

                {startingPoint === "import" ? (
                  <div className="space-y-1">
                    <Label className="text-xs">Block JSON</Label>
                    <Textarea
                      value={importJson}
                      onChange={(e) => setImportJson(e.target.value)}
                      placeholder='Paste MotionBlockLibraryEntry JSON…'
                      rows={6}
                      className="font-mono text-xs"
                    />
                    {!importValid && importJson.trim() ? (
                      <p className="text-[10px] text-red-500">Invalid JSON — fix before continuing.</p>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}

            {step === 1 ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Name</Label>
                  <Input
                    value={blockName}
                    onChange={(e) => setBlockName(e.target.value)}
                    placeholder="Hero split reveal"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Family</Label>
                  <Select value={family} onValueChange={(v) => setFamily(v as MotionBlockFamily)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MOTION_BLOCK_FAMILIES.map((f) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Tags (comma-separated)</Label>
                  <Input
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="hero, product, launch"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Intended use (comma-separated)</Label>
                  <Input
                    value={intendedUse}
                    onChange={(e) => setIntendedUse(e.target.value)}
                    placeholder="Social cutdown, keynote opener"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Supported formats</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {FORMAT_OPTIONS.map((format) => (
                      <button
                        key={format}
                        type="button"
                        onClick={() => toggleFormat(format)}
                        className={cn(
                          "rounded-md border px-2 py-1 text-[10px] transition-colors",
                          supportedFormats.includes(format)
                            ? "border-primary bg-primary/10"
                            : "border-border hover:bg-secondary",
                        )}
                      >
                        {format}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Select slot types. Required slots are inferred from selection order.
                </p>
                <div className="flex flex-wrap gap-2">
                  {SLOT_TYPES.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => toggleSlot(slot)}
                      className={cn(
                        "rounded-md border px-2.5 py-1 text-xs transition-colors",
                        selectedSlots.includes(slot)
                          ? "border-primary bg-primary/10"
                          : "border-border hover:bg-secondary",
                      )}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Layout primitives define responsive behavior. Full layout rules persist only when
                  exported to blocks.ts.
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {LAYOUT_PRIMITIVES.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPrimitive(p)}
                      className={cn(
                        "rounded-md border px-3 py-2 text-xs transition-colors",
                        primitive === p
                          ? "border-primary bg-primary/10"
                          : "border-border hover:bg-secondary",
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {step === 4 ? (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {MOTION_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setMotionPreset(preset)}
                      className={cn(
                        "rounded-md border px-3 py-2 text-xs transition-colors",
                        motionPreset === preset
                          ? "border-primary bg-primary/10"
                          : "border-border hover:bg-secondary",
                      )}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Motion recipe: {motionPreset}. Duration and stagger use block defaults until
                  persisted.
                </p>
              </div>
            ) : null}

            {step === 5 ? (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Live validation against demo brand kits. Failures are expected for new drafts
                  without layout rules.
                </p>
                {!draftPreview ? (
                  <p className="text-xs text-amber-600">No preview block — go back and fix basics or import.</p>
                ) : (
                  <>
                    <p className="text-xs">
                      {matrixPassCount} / {testMatrix.length} cells pass
                    </p>
                    <div className="overflow-x-auto rounded border border-border">
                      <table className="w-full text-[9px]">
                        <thead>
                          <tr>
                            <th className="p-1.5 text-left font-medium text-muted-foreground">Brand</th>
                            <th className="p-1.5 text-center font-medium text-muted-foreground">16:9</th>
                            <th className="p-1.5 text-center font-medium text-muted-foreground">9:16</th>
                            <th className="p-1.5 text-center font-medium text-muted-foreground">1:1</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studioBrandPresets.map((b) => (
                            <tr key={b.id}>
                              <td className="p-1.5 text-muted-foreground">{b.name}</td>
                              {(["16:9", "9:16", "1:1"] as const).map((ar) => {
                                const cell = testMatrix.find(
                                  (m) => m.brandId === b.id && m.aspectRatio === ar,
                                );
                                return (
                                  <td key={ar} className="p-1.5 text-center">
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
                  </>
                )}
              </div>
            ) : null}

            {step === 6 ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Save to the session registry or export for a developer to merge into blocks.ts.
                </p>
                {draftPreview ? (
                  <dl className="rounded border border-border bg-secondary/30 p-3 text-[11px]">
                    <div className="flex justify-between gap-2">
                      <dt className="text-muted-foreground">Name</dt>
                      <dd className="font-medium">{draftPreview.name}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-muted-foreground">Family</dt>
                      <dd>{draftPreview.family}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="text-muted-foreground">Slots</dt>
                      <dd>{draftPreview.slots.length}</dd>
                    </div>
                  </dl>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={handleSaveDraft} disabled={!draftPreview}>
                    Save Draft
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleSendToReview} disabled={!draftPreview}>
                    Send to Review
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleExportForDeveloper}
                    disabled={!draftPreview}
                  >
                    Export for Developer
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </main>
      </div>

      <footer className="flex shrink-0 items-center justify-between border-t border-border px-4 py-2">
        <Button
          variant="outline"
          size="sm"
          disabled={step === 0}
          onClick={() => setStep((s) => s - 1)}
        >
          <ArrowLeft className="mr-1 h-3.5 w-3.5" />
          Previous
        </Button>
        {step < FLOW_STEPS.length - 1 ? (
          <Button
            size="sm"
            disabled={step === 0 && !canProceedFromStart}
            onClick={() => setStep((s) => Math.min(FLOW_STEPS.length - 1, s + 1))}
          >
            Next
            <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        ) : null}
      </footer>
    </div>
  );
}
