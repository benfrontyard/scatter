import { motionBlockMap } from "@/config/blocks";
import { mergeWave1LayoutOverrides } from "@/config/composition/wave1-overrides";
import { transitionDefinitionMap } from "@/config/transitions";
import { legacyEasingToId } from "@/lib/easing";
import { resolveDefinitionIdToPresetId } from "@/lib/transitions/migrate-transition";
import type { BlockTransition, MotionBlockInstance } from "@/types";

function createInstanceId(blockId: string): string {
  return `${blockId}-${crypto.randomUUID().slice(0, 8)}`;
}

export function createBlockInstance(
  blockId: string,
  overrides?: Partial<MotionBlockInstance>,
): MotionBlockInstance {
  const definition = motionBlockMap[blockId];
  if (!definition) {
    throw new Error(`Unknown block: ${blockId}`);
  }

  const layoutOverrides = mergeWave1LayoutOverrides(blockId, overrides?.layoutOverrides);
  const { content: contentOverrides, motion: motionOverrides, ...restOverrides } = overrides ?? {};

  return {
    id: createInstanceId(blockId),
    blockId,
    ...restOverrides,
    duration: restOverrides.duration ?? definition.defaultDuration,
    content: { ...definition.defaultContent, ...contentOverrides },
    motion: { ...definition.defaultMotion, ...motionOverrides },
    ...(layoutOverrides ? { layoutOverrides } : {}),
  };
}

export function createTransitionBetween(
  fromBlock: MotionBlockInstance,
  toBlock: MotionBlockInstance,
  transitionId: string,
  overrides?: Partial<BlockTransition>,
): BlockTransition {
  const definition = transitionDefinitionMap[transitionId];
  if (!definition) {
    throw new Error(`Unknown transition: ${transitionId}`);
  }

  const presetId = resolveDefinitionIdToPresetId(transitionId);

  return {
    id: `transition-${crypto.randomUUID().slice(0, 8)}`,
    fromBlockId: fromBlock.id,
    toBlockId: toBlock.id,
    type: definition.type,
    duration: definition.defaultDuration,
    direction: definition.defaultDirection,
    easingId:
      definition.defaultEasingId ??
      (definition.defaultEasing ? legacyEasingToId(definition.defaultEasing) : "ease-in-out"),
    overlap: definition.defaultOverlap,
    ...overrides,
    presetId: overrides?.presetId ?? presetId,
  };
}

export function createBlockFromDefinition(blockId: string): MotionBlockInstance {
  return createBlockInstance(blockId);
}
