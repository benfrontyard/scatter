import { motionBlockMap } from "@/config/blocks";
import { mergeWave1LayoutOverrides } from "@/config/composition/wave1-overrides";
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

  const layoutOverrides = mergeWave1LayoutOverrides(blockId, overrides?.layoutOverrides);

  return {
    id: createInstanceId(blockId),
    blockId,
    duration: definition.defaultDuration,
    content: { ...definition.defaultContent },
    motion: { ...definition.defaultMotion },
    ...overrides,
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

const editorialStatement = createBlockInstance("editorial-statement");
const heroPromptBar = createBlockInstance("hero-prompt-bar");
const heroSplit = createBlockInstance("hero-split-text-media");
const templateCarousel = createBlockInstance("template-carousel");
const cardCollage = createBlockInstance("card-collage-dof");
const bigStatProof = createBlockInstance("big-stat-proof");
const brandPayoff = createBlockInstance("brand-payoff");

export const defaultMotionSequence: MotionSequence = {
  id: "demo-sequence",
  name: "Product Launch",
  format: defaultFormatId,
  brandPresetId: defaultBrandPresetId,
  blocks: [
    editorialStatement,
    heroPromptBar,
    heroSplit,
    templateCarousel,
    cardCollage,
    bigStatProof,
    brandPayoff,
  ],
  transitions: [
    createTransitionBetween(editorialStatement, heroPromptBar, "crossfade"),
    createTransitionBetween(heroPromptBar, heroSplit, "crossfade"),
    createTransitionBetween(heroSplit, templateCarousel, "push"),
    createTransitionBetween(templateCarousel, cardCollage, "crossfade"),
    createTransitionBetween(cardCollage, bigStatProof, "push"),
    createTransitionBetween(bigStatProof, brandPayoff, "crossfade"),
  ],
};

export function createBlockFromDefinition(blockId: string): MotionBlockInstance {
  return createBlockInstance(blockId);
}
