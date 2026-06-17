import { motionBlockMap } from "@/config/blocks";
import { defaultBrandPresetId } from "@/config/brands";
import { defaultFormatId } from "@/config/formats";
import { transitionDefinitionMap } from "@/config/transitions";
import { legacyEasingToId } from "@/lib/easing";
import type { BlockTransition, MotionBlockInstance, MotionSequence } from "@/types";

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

  return {
    id: createInstanceId(blockId),
    blockId,
    duration: definition.defaultDuration,
    content: { ...definition.defaultContent },
    motion: { ...definition.defaultMotion },
    ...overrides,
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
  };
}

const logoReveal = createBlockInstance("logo-reveal");
const featureAnnouncement = createBlockInstance("feature-announcement");
const statCard = createBlockInstance("stat-card");
const ctaLockup = createBlockInstance("cta-lockup");

export const defaultMotionSequence: MotionSequence = {
  id: "demo-sequence",
  name: "Product Launch",
  format: defaultFormatId,
  brandPresetId: defaultBrandPresetId,
  blocks: [logoReveal, featureAnnouncement, statCard, ctaLockup],
  transitions: [
    createTransitionBetween(logoReveal, featureAnnouncement, "crossfade"),
    createTransitionBetween(featureAnnouncement, statCard, "push"),
    createTransitionBetween(statCard, ctaLockup, "crossfade"),
  ],
};

export function createBlockFromDefinition(blockId: string): MotionBlockInstance {
  return createBlockInstance(blockId);
}
