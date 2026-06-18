import { resolveMotionSafeAreas } from "@/config/motion/safe-areas";
import type { BrandPreset } from "@/types";
import type {
  MotionAspectRatio,
  MotionBlockLibraryEntry,
  MotionBlockWarning,
  PlaygroundTestScenario,
} from "@/types/motion-block-library";
import { getLayoutForFormat } from "./utils";

type SlotContent = Record<string, string>;
type AssetPresence = Record<string, boolean>;

function luminance(hex: string): number {
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16) / 255;
  const g = parseInt(c.slice(2, 4), 16) / 255;
  const b = parseInt(c.slice(4, 6), 16) / 255;
  const lin = (v: number) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrastRatio(fg: string, bg: string): number {
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function slotOutsideSafe(
  slotLayout: { anchor: { x: number; y: number }; width: number; height: number },
  safe: ReturnType<typeof resolveMotionSafeAreas>,
): boolean {
  const left = slotLayout.anchor.x;
  const top = slotLayout.anchor.y;
  const right = left + slotLayout.width;
  const bottom = top + slotLayout.height;
  return (
    left < safe.hard.left ||
    top < safe.hard.top ||
    right > 1 - safe.hard.right ||
    bottom > 1 - safe.hard.bottom
  );
}

export function validateMotionBlock(
  block: MotionBlockLibraryEntry,
  aspectRatio: MotionAspectRatio,
  content: SlotContent,
  assets: AssetPresence,
  brand: BrandPreset,
  scenario: PlaygroundTestScenario = "default",
): MotionBlockWarning[] {
  const warnings: MotionBlockWarning[] = [];
  const layout = getLayoutForFormat(block, aspectRatio);
  const safe = resolveMotionSafeAreas(aspectRatio, block.safeAreas.respectVerticalDanger);

  for (const req of block.requiredAssets) {
    if (!assets[req.id]) {
      warnings.push({
        code: "missing-required-asset",
        message: `Missing required asset: ${req.label}`,
        slotId: req.slotId,
        severity: "error",
      });
    }
  }

  if (scenario === "missing-assets") {
    for (const req of block.requiredAssets) {
      if (!warnings.some((w) => w.code === "missing-required-asset" && w.slotId === req.slotId)) {
        warnings.push({
          code: "missing-required-asset",
          message: `Test scenario: missing ${req.label}`,
          slotId: req.slotId,
          severity: "error",
        });
      }
    }
  }

  for (const slot of block.slots) {
    const text = content[slot.id] ?? "";
    if (slot.maxLength && text.length > slot.maxLength) {
      const code =
        slot.role === "headline"
          ? "headline-too-long"
          : slot.role === "subhead"
            ? "subhead-too-long"
            : "headline-too-long";
      warnings.push({
        code,
        message: `${slot.label} exceeds ${slot.maxLength} characters (${text.length})`,
        slotId: slot.id,
        severity: "warning",
      });
    }

    if (slot.minReadableSize && text.length > 0) {
      warnings.push({
        code: "small-text-unreadable",
        message: `${slot.label} may be too small to read at this format`,
        slotId: slot.id,
        severity: "info",
      });
    }
  }

  if (layout) {
    const visibleSlots = layout.slots.filter((sl) => {
      const slotDef = block.slots.find((s) => s.id === sl.slotId);
      if (!slotDef) return false;
      if (scenario === "missing-assets" && slotDef.type === "media") return false;
      return slotDef.required || content[sl.slotId];
    });

    if (block.responsiveRules.maxElements && visibleSlots.length > block.responsiveRules.maxElements) {
      warnings.push({
        code: "too-many-elements",
        message: `${visibleSlots.length} elements exceed max of ${block.responsiveRules.maxElements} for this format`,
        severity: "warning",
      });
    }

    for (const sl of layout.slots) {
      if (slotOutsideSafe(sl, safe)) {
        const slotDef = block.slots.find((s) => s.id === sl.slotId);
        if (slotDef?.type === "text") {
          warnings.push({
            code: "text-outside-safe-area",
            message: `${slotDef.label} extends outside hard safe area`,
            slotId: sl.slotId,
            severity: "warning",
          });
        }
      }
    }
  }

  const ratio = contrastRatio(brand.colors.foreground, brand.colors.background);
  if (ratio < 4.5 || scenario === "low-contrast") {
    warnings.push({
      code: "low-contrast",
      message: `Text contrast ratio ${ratio.toFixed(1)}:1 is below WCAG AA (4.5:1)`,
      severity: scenario === "low-contrast" ? "error" : "warning",
    });
  }

  if (scenario === "wide-logo") {
    warnings.push({
      code: "logo-too-wide",
      message: "Logo exceeds recommended width for this layout",
      slotId: "logo",
      severity: "warning",
    });
  }

  if (scenario === "tall-logo") {
    warnings.push({
      code: "logo-too-tall",
      message: "Logo exceeds recommended height for this layout",
      slotId: "logo",
      severity: "warning",
    });
  }

  if (scenario === "bad-crop") {
    const mediaSlots = block.slots.filter((s) => s.type === "media");
    for (const slot of mediaSlots) {
      warnings.push({
        code: "focal-point-cropped",
        message: `Focal point may be cropped in ${slot.label}`,
        slotId: slot.id,
        severity: "warning",
      });
    }
  }

  return warnings;
}
