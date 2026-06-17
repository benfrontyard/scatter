import { motionBlockMap } from "@/config/blocks";
import { brandPresetMap } from "@/config/brands";
import { motionFormatMap } from "@/config/formats";
import { getBlockStartFrame } from "@/lib/sequence-utils";
import type { MotionSequence } from "@/types";
import { AbsoluteFill, Sequence as RemotionSequence, useCurrentFrame } from "remotion";
import { renderBlockContent } from "./blocks";
import { getBlockTransitionOverlay } from "./transitions";

export type ScatterCompositionProps = {
  sequence: MotionSequence;
};

export function ScatterComposition({ sequence }: ScatterCompositionProps) {
  const brand = brandPresetMap[sequence.brandPresetId] ?? Object.values(brandPresetMap)[0];
  const format = motionFormatMap[sequence.format] ?? Object.values(motionFormatMap)[0];

  return (
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
              formatWidth={format.width}
              formatHeight={format.height}
            >
              {renderBlockContent({
                brand,
                block,
                definition,
                formatWidth: format.width,
                formatHeight: format.height,
              })}
            </BlockWithTransitions>
          </RemotionSequence>
        );
      })}
    </AbsoluteFill>
  );
}

type BlockWithTransitionsProps = {
  blockIndex: number;
  blockDuration: number;
  sequence: MotionSequence;
  formatWidth: number;
  formatHeight: number;
  children: React.ReactNode;
};

function BlockWithTransitions({
  blockIndex,
  blockDuration,
  sequence,
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
