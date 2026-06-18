import { analyzeMusic, analyzeVoiceover } from "@/lib/audio";
import { runMagicEdit } from "@/lib/magic-edit";
import type {
  BrandPreset,
  MagicEditResult,
  MagicEditSettings,
  MotionBlockInstance,
  MotionSequence,
  ProjectAsset,
  SequenceAudio,
} from "@/types";
import { DEFAULT_MAGIC_EDIT_SETTINGS } from "@/types/magic-edit";

export type MagicEditPipelineInput = {
  sequence: MotionSequence;
  assets: ProjectAsset[];
  brand: BrandPreset;
  settings?: Partial<MagicEditSettings>;
};

export type MagicEditPipelineResult = {
  result: MagicEditResult;
  audio: SequenceAudio;
};

export async function runMagicEditPipeline(
  input: MagicEditPipelineInput,
): Promise<MagicEditPipelineResult> {
  const settings: MagicEditSettings = {
    ...DEFAULT_MAGIC_EDIT_SETTINGS,
    ...input.settings,
  };

  const voiceover = input.sequence.audio?.voiceover;
  if (!voiceover) {
    throw new Error("Add a voiceover track before running Magic Edit.");
  }

  const voAsset = input.assets.find((a) => a.id === voiceover.assetId);
  if (!voAsset || voAsset.type !== "audio") {
    throw new Error("Voiceover audio asset not found.");
  }

  const voResult = await analyzeVoiceover({
    dataUrl: voAsset.dataUrl,
    transcript: voiceover.transcript,
    wordTimestamps: voiceover.wordTimestamps,
    pauseCleanup: settings.pauseCleanup,
  });

  let musicAnalysis;
  const music = input.sequence.audio?.music;
  if (music) {
    const musicAsset = input.assets.find((a) => a.id === music.assetId);
    if (musicAsset?.type === "audio") {
      const musicResult = await analyzeMusic({
        dataUrl: musicAsset.dataUrl,
        targetDuration: voResult.analysis.duration,
        fitMode: settings.musicFit,
      });
      musicAnalysis = musicResult.analysis;
    }
  }

  const lockedBlockIds = new Set(
    input.sequence.blocks.filter((b) => b.timingLocked).map((b) => b.id),
  );

  const result = runMagicEdit({
    blocks: input.sequence.blocks,
    voiceoverAnalysis: voResult.analysis,
    musicAnalysis,
    brand: input.brand,
    fps: input.sequence.fps ?? 30,
    settings,
    lockedBlockIds,
  });

  const audio: SequenceAudio = {
    voiceover: {
      ...voiceover,
      analysis: voResult.analysis,
      trimStart: voResult.trimStart,
      trimEnd: voResult.trimEnd,
    },
    music: music
      ? {
          ...music,
          analysis: musicAnalysis,
        }
      : undefined,
    mix: result.mix,
    markers: result.markers,
  };

  return { result, audio };
}

export function applyMagicEditToSequence(
  sequence: MotionSequence,
  pipeline: MagicEditPipelineResult,
): MotionSequence {
  return {
    ...sequence,
    blocks: pipeline.result.blocks,
    audio: pipeline.audio,
  };
}

export function applyMagicEditBlocks(
  blocks: MotionBlockInstance[],
  result: MagicEditResult,
  preserveLocked = true,
): MotionBlockInstance[] {
  const resultMap = new Map(result.blocks.map((b) => [b.id, b]));
  return blocks.map((block) => {
    if (preserveLocked && block.timingLocked) return block;
    return resultMap.get(block.id) ?? block;
  });
}
