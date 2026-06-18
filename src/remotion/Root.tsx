import { Composition } from "remotion";
import { defaultMotionSequence } from "@/config/sequences/default";
import { motionFormatMap } from "@/config/formats";
import { getSequenceDurationInFrames } from "@/lib/sequence-utils";
import { EDITOR_FPS } from "@/types/editor";
import { ScatterComposition, type ScatterCompositionProps } from "./ScatterComposition";

const defaultFormat = motionFormatMap[defaultMotionSequence.format];

export const RemotionRoot = () => {
  return (
    <Composition
      id="Scatter"
      component={ScatterComposition}
      durationInFrames={getSequenceDurationInFrames(defaultMotionSequence)}
      fps={EDITOR_FPS}
      width={defaultFormat.width}
      height={defaultFormat.height}
      defaultProps={{
        sequence: defaultMotionSequence,
        customBrands: [],
        assets: [],
      } satisfies ScatterCompositionProps}
      calculateMetadata={async ({ props }) => {
        const { sequence, customBrands, assets } = props as ScatterCompositionProps;
        const format =
          motionFormatMap[sequence.format] ?? Object.values(motionFormatMap)[0];
        const fps = sequence.fps ?? EDITOR_FPS;

        return {
          durationInFrames: getSequenceDurationInFrames(sequence),
          fps,
          width: format.width,
          height: format.height,
          props: { sequence, customBrands: customBrands ?? [], assets: assets ?? [] },
        };
      }}
    />
  );
};
