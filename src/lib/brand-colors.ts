import type { BrandColors } from "@/types/brand";

export function normalizeBrandColors(colors: BrandColors): BrandColors {
  return {
    background: colors.background,
    foreground: colors.foreground,
    accent: colors.accent,
    muted: colors.muted,
    surface: colors.surface ?? deriveSurface(colors.background),
    border: colors.border ?? deriveBorder(colors.foreground, colors.background),
  };
}

function deriveSurface(background: string): string {
  const rgb = parseHex(background);
  if (!rgb) return background;
  const lift = isDark(rgb) ? 14 : -6;
  return adjustRgb(rgb, lift);
}

function deriveBorder(foreground: string, background: string): string {
  const fg = parseHex(foreground);
  const bg = parseHex(background);
  if (!fg || !bg) return `${foreground}22`;
  const mix = isDark(bg) ? 0.12 : 0.1;
  return blendHex(fg, bg, mix);
}

function parseHex(hex: string): [number, number, number] | null {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return null;
  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
  ];
}

function isDark([r, g, b]: [number, number, number]): boolean {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 < 0.5;
}

function adjustRgb([r, g, b]: [number, number, number], delta: number): string {
  const clamp = (v: number) => Math.min(255, Math.max(0, v));
  return `#${[r, g, b]
    .map((c) => clamp(c + delta).toString(16).padStart(2, "0"))
    .join("")}`;
}

function blendHex(
  [r1, g1, b1]: [number, number, number],
  [r2, g2, b2]: [number, number, number],
  amount: number,
): string {
  const mix = (a: number, b: number) => Math.round(a * amount + b * (1 - amount));
  return `#${[mix(r1, r2), mix(g1, g2), mix(b1, b2)]
    .map((c) => c.toString(16).padStart(2, "0"))
    .join("")}`;
}
