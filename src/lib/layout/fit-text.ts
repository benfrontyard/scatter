import type { ResolvedTypographyRole, TypographyRoleName } from "@/types/typography-role";
import { resolvedRoleToCss } from "./typography-css";
import type { CSSProperties } from "react";

type FitTextOptions = {
  maxLines?: number;
  containerWidth?: number;
  minFontSize?: number;
};

function charWidthRatio(fontWeight: number): number {
  return fontWeight >= 700 ? 0.58 : fontWeight >= 600 ? 0.55 : 0.52;
}

function countWrappedLines(words: string[], charsPerLine: number): number {
  if (words.length === 0) return 0;

  let lines = 1;
  let currentLen = 0;

  for (const word of words) {
    const tokenLen = word.length;
    const withSpace = currentLen > 0 ? tokenLen + 1 : tokenLen;

    if (currentLen > 0 && currentLen + withSpace > charsPerLine) {
      lines += 1;
      currentLen = tokenLen;
    } else {
      currentLen += withSpace;
    }
  }

  return lines;
}

export function defaultMaxLinesForRole(role: TypographyRoleName): number {
  switch (role) {
    case "display":
    case "stat":
      return 3;
    case "heading":
    case "subheading":
      return 4;
    default:
      return 6;
  }
}

/** Shrink font size until text fits container width without mid-word breaks. */
export function fitFontSizeToWidth(
  text: string,
  baseFontSize: number,
  maxWidth: number,
  options?: FitTextOptions & { fontWeight?: number },
): number {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length || maxWidth <= 0) return baseFontSize;

  const maxLines = options?.maxLines ?? 4;
  const minSize = options?.minFontSize ?? Math.max(12, baseFontSize * 0.42);
  const ratio = charWidthRatio(options?.fontWeight ?? 400);

  let size = baseFontSize;

  while (size >= minSize) {
    const widestWord = Math.max(...words.map((word) => word.length * size * ratio));
    if (widestWord > maxWidth) {
      size *= 0.94;
      continue;
    }

    const charsPerLine = Math.max(4, Math.floor(maxWidth / (size * ratio)));
    const lines = countWrappedLines(words, charsPerLine);
    if (lines <= maxLines) {
      return Math.round(size);
    }

    size *= 0.94;
  }

  return Math.round(minSize);
}

export function fitResolvedRole(
  role: ResolvedTypographyRole,
  text: string,
  options?: FitTextOptions,
): ResolvedTypographyRole {
  if (!role.autoFit || !text.trim()) return role;

  const containerWidth = options?.containerWidth ?? role.maxWidth;
  const maxLines = options?.maxLines ?? defaultMaxLinesForRole(role.role);
  const fontSize = fitFontSizeToWidth(text, role.fontSize, containerWidth, {
    maxLines,
    minFontSize: options?.minFontSize ?? Math.max(12, role.fontSize * 0.42),
    fontWeight: role.fontWeight,
  });

  return { ...role, fontSize };
}

export function fitResolvedRoleToCss(
  role: ResolvedTypographyRole,
  text: string,
  options?: FitTextOptions,
): CSSProperties {
  return resolvedRoleToCss(fitResolvedRole(role, text, options));
}
