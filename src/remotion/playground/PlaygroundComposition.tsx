import { getBrandFontFamilies } from "@/lib/typography";
import type { BrandPreset, MotionFormat, ProjectAsset } from "@/types";
import type {
  MotionAspectRatio,
  MotionBlockLibraryEntry,
  PlaygroundDebugLayer,
} from "@/types/motion-block-library";
import { AbsoluteFill } from "remotion";
import { LoadProjectFont } from "../LoadProjectFont";
import { LibraryBlockRenderer } from "./LibraryBlockRenderer";

export type PlaygroundCompositionProps = {
  block: MotionBlockLibraryEntry;
  aspectRatio: MotionAspectRatio;
  format: MotionFormat;
  brand: BrandPreset;
  content: Record<string, string>;
  assets: ProjectAsset[];
  assetPresence: Record<string, boolean>;
  debugLayers: PlaygroundDebugLayer[];
};

export function PlaygroundComposition({
  block,
  aspectRatio,
  brand,
  content,
  assets,
  assetPresence,
  debugLayers,
}: PlaygroundCompositionProps) {
  return (
    <AbsoluteFill>
      <LoadProjectFont families={getBrandFontFamilies(brand.typography)} />
      <LibraryBlockRenderer
        block={block}
        aspectRatio={aspectRatio}
        brand={brand}
        content={content}
        assets={assets}
        assetPresence={assetPresence}
        debugLayers={debugLayers}
      />
    </AbsoluteFill>
  );
}

export function getPlaygroundDuration(block: MotionBlockLibraryEntry): number {
  return block.duration;
}
