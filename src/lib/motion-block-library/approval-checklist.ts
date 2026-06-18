import type { BrandPreset } from "@/types";
import type {
  MotionAspectRatio,
  MotionBlockLibraryEntry,
  MotionBlockWarning,
} from "@/types/motion-block-library";
import { canUseProductionPlaygroundRenderer } from "./playground-preview";
import { getApprovedBlockVisibilityIssues } from "./visibility";
import { getRequiredSlots } from "./utils";

export type ApprovalCheckItem = {
  id: string;
  label: string;
  passed: boolean;
  required: boolean;
  detail?: string;
};

export type ApprovalChecklistInput = {
  block: MotionBlockLibraryEntry | null;
  aspectRatio: MotionAspectRatio;
  warnings: MotionBlockWarning[];
  previewRenderable: boolean;
  productionRendererAvailable: boolean;
  productionRendererSucceeded: boolean;
  usingFallbackRenderer: boolean;
};

export function getApprovalChecklist(input: ApprovalChecklistInput): ApprovalCheckItem[] {
  const { block, aspectRatio, warnings, previewRenderable } = input;

  if (!block) {
    return [
      {
        id: "block-selected",
        label: "Block selected",
        passed: false,
        required: true,
        detail: "Select a block from the library",
      },
    ];
  }

  const criticalErrors = warnings.filter((w) => w.severity === "error");
  const requiredSlots = getRequiredSlots(block);
  const missingRequiredSlots = requiredSlots.filter(
    (slot) => !block.slots.some((s) => s.id === slot.id),
  );
  const hasLayout = Boolean(block.layoutRules[aspectRatio]);
  const visibilityIssues = getApprovedBlockVisibilityIssues(block);
  const hasThumbnail = Boolean(block.debugMetadata?.rendererId || block.editorBlockId);
  const hasFormats = Boolean(block.supportedFormats?.length);

  const items: ApprovalCheckItem[] = [
    {
      id: "preview-renders",
      label: "Preview renders",
      passed: previewRenderable,
      required: true,
      detail: previewRenderable ? undefined : "Preview did not render for current settings",
    },
    {
      id: "required-slots",
      label: "Required slots defined",
      passed: missingRequiredSlots.length === 0,
      required: true,
      detail:
        missingRequiredSlots.length > 0
          ? `Missing: ${missingRequiredSlots.map((s) => s.label).join(", ")}`
          : undefined,
    },
    {
      id: "supported-formats",
      label: "Supported formats configured",
      passed: hasFormats,
      required: true,
      detail: hasFormats ? undefined : "No supported aspect ratios defined",
    },
    {
      id: "layout-for-format",
      label: `Layout for ${aspectRatio}`,
      passed: hasLayout,
      required: true,
      detail: hasLayout ? undefined : `No layout rules for ${aspectRatio}`,
    },
    {
      id: "thumbnail",
      label: "Thumbnail / renderer metadata",
      passed: hasThumbnail,
      required: true,
      detail: hasThumbnail ? undefined : "Missing rendererId or editor bridge",
    },
    {
      id: "no-critical-errors",
      label: "No critical validation errors",
      passed: criticalErrors.length === 0,
      required: true,
      detail:
        criticalErrors.length > 0
          ? `${criticalErrors.length} error${criticalErrors.length === 1 ? "" : "s"}`
          : undefined,
    },
  ];

  if (input.productionRendererAvailable) {
    items.push({
      id: "production-renderer",
      label: "Production renderer passes",
      passed: input.productionRendererSucceeded && !input.usingFallbackRenderer,
      required: true,
      detail: input.usingFallbackRenderer
        ? "Using playground fallback renderer"
        : input.productionRendererSucceeded
          ? undefined
          : "Production renderer failed or returned null",
    });
  }

  if (block.status === "approved") {
    items.push({
      id: "canvas-visibility",
      label: "Visible in Canvas library",
      passed: visibilityIssues.length === 0,
      required: false,
      detail:
        visibilityIssues.length > 0
          ? visibilityIssues.join(", ")
          : "Block will appear in Canvas block drawer",
    });
  }

  return items;
}

export function canApproveBlock(checklist: ApprovalCheckItem[]): boolean {
  return checklist.filter((item) => item.required).every((item) => item.passed);
}

export function getTestMatrixResults(
  block: MotionBlockLibraryEntry,
  brands: BrandPreset[],
  aspectRatios: MotionAspectRatio[],
  validate: (
    block: MotionBlockLibraryEntry,
    aspectRatio: MotionAspectRatio,
    brand: BrandPreset,
  ) => MotionBlockWarning[],
): { brandId: string; aspectRatio: MotionAspectRatio; ok: boolean; errorCount: number }[] {
  return brands.flatMap((brand) =>
    aspectRatios.map((aspectRatio) => {
      const hasLayout = Boolean(block.layoutRules[aspectRatio]);
      const supported = block.supportedFormats?.includes(aspectRatio) ?? false;
      const warnings = validate(block, aspectRatio, brand);
      const errors = warnings.filter((w) => w.severity === "error").length;
      return {
        brandId: brand.id,
        aspectRatio,
        ok: hasLayout && supported && errors === 0,
        errorCount: errors,
      };
    }),
  );
}

export function blockSupportsProductionRenderer(block: MotionBlockLibraryEntry): boolean {
  return canUseProductionPlaygroundRenderer(block);
}
