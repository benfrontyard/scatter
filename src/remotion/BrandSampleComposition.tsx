import { motionBlockMap } from "@/config/blocks";
import { createBlockInstance } from "@/config/sequences/default";
import { getBrandFontFamilies } from "@/lib/typography";
import type { BrandPreset, MotionFormat, ProjectAsset } from "@/types";
import { AbsoluteFill } from "remotion";
import { useMemo } from "react";
import { renderBlockContent } from "./blocks";
import { LoadProjectFont } from "./LoadProjectFont";

export type BrandSampleCompositionProps = {
  brand: BrandPreset;
  format: MotionFormat;
  blockId: string;
  logoText: string;
  assets?: ProjectAsset[];
};

export function BrandSampleComposition({
  brand,
  format,
  blockId,
  logoText,
  assets = [],
}: BrandSampleCompositionProps) {
  const block = useMemo(() => {
    const instance = createBlockInstance(blockId);
    return {
      ...instance,
      content: {
        ...instance.content,
        logoText,
        message: instance.content.message ?? "Ready to ship?",
        headline: instance.content.headline ?? "Ship faster",
        subhead: instance.content.subhead ?? "Motion blocks powered by your brand system.",
      },
    };
  }, [blockId, logoText]);

  const definition = motionBlockMap[blockId];

  return (
    <AbsoluteFill>
      <LoadProjectFont families={getBrandFontFamilies(brand.typography)} />
      {definition
        ? renderBlockContent({ brand, block, definition, format, assets })
        : null}
    </AbsoluteFill>
  );
}

export function getBrandSampleDuration(blockId: string): number {
  return motionBlockMap[blockId]?.defaultDuration ?? 90;
}
