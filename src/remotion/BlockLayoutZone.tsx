import type { ResolvedBlockLayout } from "@/types/block-layout";
import type { CSSProperties, ReactNode } from "react";

type BlockLayoutZoneProps = {
  layout: ResolvedBlockLayout;
  children: ReactNode;
  style?: CSSProperties;
};

/** Positions children within the resolved content zone from the layout engine. */
export function BlockLayoutZone({ layout, children, style }: BlockLayoutZoneProps) {
  const zone = layout.contentZone;

  return (
    <div
      style={{
        position: "absolute",
        left: zone.x,
        top: zone.y,
        width: zone.width,
        height: zone.height,
        display: "flex",
        flexDirection: layout.stackDirection,
        alignItems: zone.alignItems,
        justifyContent: zone.justifyContent,
        textAlign: zone.textAlign,
        gap: layout.gap,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

type LogoPlacementLayerProps = {
  layout: ResolvedBlockLayout;
  children: ReactNode;
  style?: CSSProperties;
};

/** Absolutely positions a logo using resolved logo placement coordinates. */
export function LogoPlacementLayer({ layout, children, style }: LogoPlacementLayerProps) {
  if (!layout.logo) return null;

  const logo = layout.logo;

  return (
    <div
      style={{
        position: "absolute",
        left: logo.x,
        top: logo.y,
        width: logo.width,
        height: logo.height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
