import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEditor } from "@/context/editor-context";
import { MOTION_BLOCK_FAMILIES, createDraftBlockFromBuilder } from "@/lib/motion-block-library";
import type { MotionBlockLibraryEntry } from "@/types/motion-block-library";
import { cn } from "@/lib/utils";
import type { MotionBlockFamily } from "@/types/motion-block-library";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useState } from "react";

const BUILDER_STEPS = [
  "Choose block family",
  "Choose layout primitive",
  "Define slots",
  "Define responsive layouts",
  "Add motion presets",
  "Define fallbacks",
  "Test with sample brands",
  "Run validation",
  "Save as draft",
  "Publish when approved",
] as const;

const LAYOUT_PRIMITIVES = [
  "Full bleed",
  "Centered",
  "Split",
  "Grid",
  "Stack",
  "Collage",
  "Overlay",
  "Carousel",
  "Timeline",
  "Chart",
  "Logo lockup",
] as const;

const SLOT_TYPES = [
  "Headline",
  "Subhead",
  "Eyebrow",
  "Image",
  "Video",
  "Logo",
  "Icon",
  "Chart",
  "CTA",
  "Background",
  "Shape",
] as const;

const MOTION_PRESETS = [
  "Fade up",
  "Slide in",
  "Scale in",
  "Mask reveal",
  "Stagger",
  "Parallax",
  "Draw on",
  "Count up",
  "Card stack",
  "Camera push",
] as const;

export function BlockBuilder({
  embedded = false,
  onSaveDraftBlock,
}: {
  embedded?: boolean;
  onSaveDraftBlock?: (block: MotionBlockLibraryEntry) => void;
}) {
  const { showBlockBuilder, setShowBlockBuilder, isInternal, showToast } = useEditor();
  const [step, setStep] = useState(0);
  const [family, setFamily] = useState<MotionBlockFamily>("image-video");
  const [primitive, setPrimitive] = useState<string>(LAYOUT_PRIMITIVES[0]);
  const [blockName, setBlockName] = useState("");
  const [selectedSlots, setSelectedSlots] = useState<string[]>(["Headline"]);
  const [motionPreset, setMotionPreset] = useState<string>(MOTION_PRESETS[0]);
  const [fallbackMedia, setFallbackMedia] = useState("color-fill");

  if (!isInternal) return null;
  if (!embedded && !showBlockBuilder) return null;

  const toggleSlot = (slot: string) => {
    setSelectedSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot],
    );
  };

  const handleSaveDraft = () => {
    const draft = createDraftBlockFromBuilder({
      name: blockName || "Untitled Block",
      family,
      primitive,
      slotLabels: selectedSlots,
    });

    if (onSaveDraftBlock) {
      onSaveDraftBlock(draft);
      return;
    }

    showToast({ message: `Block "${blockName || "Untitled"}" config saved locally (not persisted).` });
    if (!embedded) setShowBlockBuilder(false);
  };

  const handleExportJson = () => {
    const config = {
      name: blockName || "Untitled",
      family,
      primitive,
      slots: selectedSlots,
      motionPreset,
      fallbackMedia,
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${(blockName || "block").replace(/\s+/g, "-").toLowerCase()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    if (!embedded) setShowBlockBuilder(false);
  };

  const body = (
    <>
      <div className="flex min-h-0 flex-1">
        <aside className="w-56 shrink-0 border-r border-border p-3 lg:w-64">
          <ol className="space-y-1">
            {BUILDER_STEPS.map((label, i) => (
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
            <h2 className="text-lg font-semibold">{BUILDER_STEPS[step]}</h2>

            {step === 0 ? (
              <div className="space-y-2">
                <Label>Block family</Label>
                <Select value={family} onValueChange={(v) => setFamily(v as MotionBlockFamily)}>
                  <SelectTrigger>
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
                <div className="space-y-1">
                  <Label>Block name</Label>
                  <Input
                    value={blockName}
                    onChange={(e) => setBlockName(e.target.value)}
                    placeholder="My new block"
                  />
                </div>
              </div>
            ) : null}

            {step === 1 ? (
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
            ) : null}

            {step === 2 ? (
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
            ) : null}

            {step === 3 ? (
              <p className="text-sm text-muted-foreground">
                Responsive layouts will be generated for 16:9, 9:16, 1:1, and 4:5 based on the{" "}
                <strong>{primitive}</strong> primitive with {selectedSlots.length} slot
                {selectedSlots.length === 1 ? "" : "s"}.
              </p>
            ) : null}

            {step === 4 ? (
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
            ) : null}

            {step === 5 ? (
              <div className="space-y-2">
                <Label>Missing media fallback</Label>
                <Select value={fallbackMedia} onValueChange={setFallbackMedia}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="color-fill">Color fill</SelectItem>
                    <SelectItem value="gradient">Gradient</SelectItem>
                    <SelectItem value="blur-placeholder">Blur placeholder</SelectItem>
                    <SelectItem value="hide">Hide</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            {step === 6 ? (
              <p className="text-sm text-muted-foreground">
                After saving, open Block Workbench to test across brands and aspect ratios.
                Family: {family}, primitive: {primitive}, motion: {motionPreset}.
              </p>
            ) : null}

            {step === 7 ? (
              <div className="space-y-2 rounded-md border border-dashed border-amber-500/40 bg-amber-500/5 p-3 text-sm">
                <p className="font-medium text-amber-700 dark:text-amber-400">
                  Validation not run
                </p>
                <p className="text-xs text-muted-foreground">
                  Automated validation requires layout rules and a production renderer bridge.
                  Save as draft and use Block Workbench to run the real test matrix.
                </p>
              </div>
            ) : null}

            {step === 8 ? (
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea placeholder="Optional notes for this draft…" rows={3} />
              </div>
            ) : null}

            {step === 9 ? (
              <p className="text-sm text-muted-foreground">
                Export the block configuration as JSON. Approval is session-only — use Review to test
                blocks with the production Canvas renderer.
              </p>
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
        <div className="flex gap-2">
          {step === 8 ? (
            <Button variant="outline" size="sm" onClick={handleSaveDraft}>
              Save as draft
            </Button>
          ) : null}
          {step === 9 ? (
            <Button size="sm" onClick={handleExportJson}>
              Export JSON
            </Button>
          ) : (
            <Button size="sm" onClick={() => setStep((s) => Math.min(BUILDER_STEPS.length - 1, s + 1))}>
              Next
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </footer>
    </>
  );

  if (embedded) {
    return <div className="flex h-full min-h-0 flex-col">{body}</div>;
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <header className="flex h-11 shrink-0 items-center gap-2 border-b border-border px-3">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5"
          onClick={() => setShowBlockBuilder(false)}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Button>
        <span className="text-sm font-semibold">Block Builder</span>
        <span className="text-xs text-muted-foreground">
          Step {step + 1} of {BUILDER_STEPS.length}
        </span>
      </header>
      {body}
    </div>
  );
}
