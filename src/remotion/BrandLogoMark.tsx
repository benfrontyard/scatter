import { resolvedRoleToCss } from "@/lib/layout/typography-css";
import { resolveFontStack } from "@/lib/typography";
import type { BrandPreset, ProjectAsset, ResolvedLogoPlacement } from "@/types";
import type { ResolvedTypographyRole } from "@/types/typography-role";
import type { CSSProperties } from "react";

type BrandLogoMarkProps = {
  brand: BrandPreset;
  placement: ResolvedLogoPlacement;
  assets?: ProjectAsset[];
  textFallback?: string;
  textStyle?: ResolvedTypographyRole;
  style?: CSSProperties;
  className?: string;
};

export function BrandLogoMark({
  brand,
  placement,
  assets = [],
  textFallback,
  textStyle,
  style,
  className,
}: BrandLogoMarkProps) {
  const dataUrl = placement.assetId
    ? assets.find((a) => a.id === placement.assetId)?.dataUrl
    : undefined;

  const showImage = !placement.useTextFallback && Boolean(dataUrl);

  if (showImage && dataUrl) {
    return (
      <img
        src={dataUrl}
        alt={placement.assetName ?? brand.name}
        className={className}
        style={{
          width: placement.width,
          height: placement.height,
          objectFit: "contain",
          objectPosition: "center",
          flexShrink: 0,
          ...style,
        }}
      />
    );
  }

  const label =
    textFallback ??
    placement.textFallback ??
    brand.logos.textFallback ??
    brand.name;

  const typeStyle = textStyle ?? {
    role: "label",
    fontFamily: resolveFontStack(brand.typography, "accent"),
    fontSize: Math.round(placement.height * 0.55),
    lineHeight: 1.1,
    fontWeight: 600,
    letterSpacing: "0.05em",
    textTransform: "none" as const,
    textAlign: "center" as const,
    maxWidth: placement.width,
    preferredMaxLineLength: 24,
    autoFit: true,
  };

  return (
    <span
      className={className}
      style={{
        ...resolvedRoleToCss(typeStyle),
        display: "inline-block",
        maxWidth: placement.width,
        color: brand.colors.accent,
        ...style,
      }}
    >
      {label}
    </span>
  );
}
