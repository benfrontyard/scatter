import { resolveBrand } from "@/lib/brand-utils";
import { motionBlockMap } from "@/config/blocks";
import { motionFormatMap } from "@/config/formats";
import { getBlockStartFrame } from "@/lib/sequence-utils";
import {
  getBrandFontFamilies,
  getTypeStyle,
  resolveFontStack,
  resolvedTypeStyleToCss,
} from "@/lib/typography";
import type { BrandPreset, MotionFormat, MotionSequence, PostFXRenderMode, ProjectAsset } from "@/types";
import { AbsoluteFill, Sequence as RemotionSequence, useCurrentFrame } from "remotion";
import { renderBlockContent } from "./blocks";
import { Block3DWrapper, CameraWrapper } from "./CameraWrapper";
import { LoadProjectFont } from "./LoadProjectFont";
import { PostFXWrapper } from "./PostFXWrapper";
import { getBlockTransitionOverlay } from "./transitions";
import { AudioTracks } from "./AudioTracks";
import { getSequenceDurationInFrames } from "@/lib/sequence-utils";

export type ScatterCompositionProps = {
  sequence: MotionSequence;
  customBrands?: BrandPreset[];
  assets?: ProjectAsset[];
  renderMode?: PostFXRenderMode;
  reducedMotion?: boolean;
};

export function ScatterComposition({
  sequence,
  customBrands = [],
  assets = [],
  renderMode = "export",
  reducedMotion = false,
}: ScatterCompositionProps) {
  const brand = resolveBrand(sequence.brandPresetId, customBrands);
  const format = motionFormatMap[sequence.format] ?? Object.values(motionFormatMap)[0];
  const fontFamilies = getBrandFontFamilies(brand.typography);
  const totalDurationFrames = getSequenceDurationInFrames(sequence);
  const emptyBodyStyle = resolvedTypeStyleToCss(
    resolveTypeStyleForEmpty(brand, format),
  );

  if (sequence.blocks.length === 0) {
    return (
      <>
        <LoadProjectFont families={fontFamilies} />
        <AbsoluteFill
          style={{
            backgroundColor: sequence.canvasBackground || brand.colors.background,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: brand.colors.muted,
            ...emptyBodyStyle,
          }}
        >
          Add a motion block to start
        </AbsoluteFill>
      </>
    );
  }

  return (
    <>
      <LoadProjectFont families={fontFamilies} />
      <AudioTracks
        audio={sequence.audio}
        assets={assets}
        totalDurationFrames={totalDurationFrames}
      />
      <AbsoluteFill style={{ backgroundColor: sequence.canvasBackground || brand.colors.background }}>
        <PostFXWrapper postFx={sequence.postFx} renderMode={renderMode}>
          <CameraWrapper sequence={sequence} renderMode={renderMode} reducedMotion={reducedMotion}>
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
                  <Block3DWrapper
                    blockIndex={index}
                    sequence={sequence}
                    renderMode={renderMode}
                    reducedMotion={reducedMotion}
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
                        format,
                        assets,
                      })}
                    </BlockWithTransitions>
                  </Block3DWrapper>
                </RemotionSequence>
              );
            })}
          </CameraWrapper>
        </PostFXWrapper>
      </AbsoluteFill>
    </>
  );
}

function resolveTypeStyleForEmpty(brand: BrandPreset, format: MotionFormat) {
  const body = getTypeStyle(brand.typography.defaults.bodyStyle, brand.typography, format);
  return {
    fontFamily: resolveFontStack(brand.typography, body.fontFamily),
    fontSize: body.fontSize,
    lineHeight: body.lineHeight,
    fontWeight: body.fontWeight,
    letterSpacing: `${body.letterSpacing}em`,
    textTransform: body.textTransform ?? "none",
  };
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
