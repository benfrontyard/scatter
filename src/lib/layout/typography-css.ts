import type { CSSProperties } from "react";
import type { ResolvedTypographyRole } from "@/types/typography-role";

export function resolvedRoleToCss(role: ResolvedTypographyRole): CSSProperties {
  return {
    fontFamily: role.fontFamily,
    fontSize: role.fontSize,
    lineHeight: role.lineHeight,
    fontWeight: role.fontWeight,
    letterSpacing: role.letterSpacing,
    textTransform: role.textTransform,
    textAlign: role.textAlign,
    maxWidth: role.maxWidth,
    overflowWrap: "break-word",
    wordBreak: "break-word",
  };
}
