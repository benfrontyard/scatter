import { resolveBrand } from "@/lib/brand-utils";
import { motionBlockMap } from "@/config/blocks";
import { motionFormatMap } from "@/config/formats";
import { getBlockStartFrame } from "@/lib/sequence-utils";
import { scaleFontSize } from "@/lib/typography";
import type { BrandPreset, MotionSequence } from "@/types";
import { AbsoluteFill, Sequence as RemotionSequence, useCurrentFrame } from "remotion";
import { renderBlockContent } from "./blocks";
import { LoadProjectFont } from "./LoadProjectFont";
import { getBlockTransitionOverlay } from "./transitions";

export type ScatterCompositionProps = {
  sequence: MotionSequence;
  customBrands?: BrandPreset[];
};

export function ScatterComposition({ sequence, customBrands = [] }: ScatterCompositionProps) {
  const brand = resolveBrand(sequence.brandPresetId, customBrands);
  const format = motionFormatMap[sequence.format] ?? Object.values(motionFormatMap)[0];

  if (sequence.blocks.length === 0) {
    return (
      <>
        <LoadProjectFont family={brand.typography.fontFamily} />
        <AbsoluteFill
          style={{
            backgroundColor: sequence.canvasBackground || brand.colors.background,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: brand.colors.muted,
            fontFamily: brand.typography.bodyFont,
            fontSize: scaleFontSize(24, sequence.typography),
          }}
        >
          Add a motion block to start
        </AbsoluteFill>
      </>
    );
  }

  return (
    <>
      <LoadProjectFont family={brand.typography.fontFamily} />
      <AbsoluteFill style={{ backgroundColor: sequence.canvasBackground || brand.colors.background }}>
        {sequence.blocks.map((block, index) => {
          const definition = motionBlockMap[block.blockId];
          if (!definition) return null;

          const startFrame = getBlockStartFrame(sequence, index);

          return (
            <RemotionSequence
              key={block.id}
              from={startFrame}
              durationInFrames={block.duration}
              layout="none"
            >
              <BlockWithTransitions
                blockIndex={index}
                blockDuration={block.duration}
                sequence={sequence}
                customBrands={customBrands}
                formatWidth={format.width}
                formatHeight={format.height}
              >
                {renderBlockContent({
                  brand,
                  block,
                  definition,
                  formatWidth: format.width,
                  formatHeight: format.height,
                  projectTypography: sequence.typography,
                })}
              </BlockWithTransitions>
            </RemotionSequence>
          );
        })}
      </AbsoluteFill>
    </>
  );
}

type BlockWithTransitionsProps = {
  blockIndex: number;
  blockDuration: number;
  sequence: MotionSequence;
  customBrands: BrandPreset[];
  formatWidth: number;
  formatHeight: number;
  children: React.ReactNode;
};

function BlockWithTransitions({
  blockIndex,
  blockDuration,
  sequence,
  customBrands,
  formatWidth,
  formatHeight,
  children,
}: BlockWithTransitionsProps) {
  const localFrame = useCurrentFrame();
  const { opacity, transform } = getBlockTransitionOverlay(
    blockIndex,
    localFrame,
    blockDuration,
    sequence,
    formatWidth,
    formatHeight,
    customBrands,
  );

  return (
    <AbsoluteFill
      style={{
        opacity,
        transform,
      }}
    >
      {children}
    </AbsoluteFill>
  );
}
