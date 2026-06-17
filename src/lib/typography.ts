import { defaultProjectFont } from "@/config/fonts";
import { buildFontStack } from "@/lib/google-fonts";
import type { BrandTypography } from "@/types/brand";
import type { ProjectTypography } from "@/types/sequence";

export const defaultProjectTypography: Required<ProjectTypography> = {
  weight: 600,
  size: 1,
  tracking: 0,
};

export function parseFontFamilyFromStack(stack?: string): string | undefined {
  if (!stack) return undefined;
  const match = stack.match(/^"([^"]+)"|^([^,]+)/);
  const family = match?.[1] ?? match?.[2];
  return family?.trim();
}

export function normalizeBrandTypography(
  typography: Partial<BrandTypography> & {
    headingFont?: string;
    bodyFont?: string;
  },
): BrandTypography {
  const fontFamily =
    typography.fontFamily ??
    parseFontFamilyFromStack(typography.headingFont) ??
    parseFontFamilyFromStack(typography.bodyFont) ??
    defaultProjectFont;
  const stack = buildFontStack(fontFamily);

  return {
    fontFamily,
    headingFont: stack,
    bodyFont: stack,
  };
}

export function resolveProjectTypography(
  typography?: ProjectTypography,
): Required<ProjectTypography> {
  return {
    weight: typography?.weight ?? defaultProjectTypography.weight,
    size: typography?.size ?? defaultProjectTypography.size,
    tracking: typography?.tracking ?? defaultProjectTypography.tracking,
  };
}

export function scaleFontSize(baseSize: number, typography?: ProjectTypography): number {
  const { size } = resolveProjectTypography(typography);
  return Math.round(baseSize * size);
}

export function headingWeight(typography?: ProjectTypography): number {
  return resolveProjectTypography(typography).weight;
}

export function bodyWeight(typography?: ProjectTypography): number {
  return Math.max(400, headingWeight(typography) - 200);
}

export function trackingEm(base: string | number, typography?: ProjectTypography): string {
  const offset = resolveProjectTypography(typography).tracking;
  const baseValue =
    typeof base === "number" ? base : Number.parseFloat(base.replace(/em$/, "")) || 0;
  return `${(baseValue + offset).toFixed(3).replace(/\.?0+$/, "")}em`;
}
