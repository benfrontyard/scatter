import { motionBlockMap } from "@/config/blocks";
import {
  createBlockInstance,
  createTransitionBetween,
} from "@/config/sequences/default";
import type { BlockTransition, MotionSequence, SequenceTimelineItem } from "@/types";

export function framesToSeconds(frames: number, fps: number): string {
  return (frames / fps).toFixed(1);
}

function pickDefaultTransitionId(
  fromBlockId: string,
  toBlockId: string,
): string {
  const fromDef = motionBlockMap[fromBlockId];
  const toDef = motionBlockMap[toBlockId];
  const fromCompatible = fromDef?.compatibleTransitions ?? [];
  const toCompatible = toDef?.compatibleTransitions ?? [];
  const shared = fromCompatible.filter((id) => toCompatible.includes(id));
  return shared[0] ?? "crossfade";
}

export function addBlockToSequence(
  sequence: MotionSequence,
  blockId: string,
): { sequence: MotionSequence; newBlockId: string } {
  const newBlock = createBlockInstance(blockId);
  const lastBlock = sequence.blocks[sequence.blocks.length - 1];
  const transitions = [...sequence.transitions];

  if (lastBlock) {
    const transitionId = pickDefaultTransitionId(lastBlock.blockId, newBlock.blockId);
    transitions.push(createTransitionBetween(lastBlock, newBlock, transitionId));
  }

  return {
    sequence: {
      ...sequence,
      blocks: [...sequence.blocks, newBlock],
      transitions,
    },
    newBlockId: newBlock.id,
  };
}

export function reorderBlockInSequence(
  sequence: MotionSequence,
  blockId: string,
  toIndex: number,
): MotionSequence {
  const fromIndex = sequence.blocks.findIndex((block) => block.id === blockId);
  if (fromIndex === -1) return sequence;

  const clampedIndex = Math.max(0, Math.min(toIndex, sequence.blocks.length - 1));
  if (fromIndex === clampedIndex) return sequence;

  const blocks = [...sequence.blocks];
  const [moved] = blocks.splice(fromIndex, 1);
  blocks.splice(clampedIndex, 0, moved);

  const transitions: BlockTransition[] = [];
  for (let i = 0; i < blocks.length - 1; i++) {
    const fromBlock = blocks[i];
    const toBlock = blocks[i + 1];
    const transitionId = pickDefaultTransitionId(fromBlock.blockId, toBlock.blockId);
    transitions.push(createTransitionBetween(fromBlock, toBlock, transitionId));
  }

  return { ...sequence, blocks, transitions };
}

export function removeBlockFromSequence(
  sequence: MotionSequence,
  blockId: string,
): MotionSequence {
  const blockIndex = sequence.blocks.findIndex((block) => block.id === blockId);
  if (blockIndex === -1) return sequence;

  const prevBlock = sequence.blocks[blockIndex - 1];
  const nextBlock = sequence.blocks[blockIndex + 1];
  const blocks = sequence.blocks.filter((block) => block.id !== blockId);
  let transitions = sequence.transitions.filter(
    (transition) =>
      transition.fromBlockId !== blockId && transition.toBlockId !== blockId,
  );

  if (prevBlock && nextBlock) {
    const transitionId = pickDefaultTransitionId(prevBlock.blockId, nextBlock.blockId);
    transitions = [
      ...transitions,
      createTransitionBetween(prevBlock, nextBlock, transitionId),
    ];
  }

  return { ...sequence, blocks, transitions };
}

export function getTransitionBetweenBlocks(
  sequence: MotionSequence,
  fromBlockIndex: number,
): BlockTransition | undefined {
  const fromBlock = sequence.blocks[fromBlockIndex];
  const toBlock = sequence.blocks[fromBlockIndex + 1];
  if (!fromBlock || !toBlock) return undefined;

  return sequence.transitions.find(
    (transition) =>
      transition.fromBlockId === fromBlock.id && transition.toBlockId === toBlock.id,
  );
}

export function getSequenceDurationInFrames(sequence: MotionSequence): number {
  const blockFrames = sequence.blocks.reduce((sum, block) => sum + block.duration, 0);
  const transitionOverlap = sequence.transitions.reduce(
    (sum, transition) => sum + Math.round(transition.duration * transition.overlap),
    0,
  );
  return Math.max(blockFrames - transitionOverlap, 1);
}

const MIN_BLOCK_DURATION_FRAMES = 15;

/** Scale all block durations proportionally to hit a target sequence length. */
export function scaleSequenceToTargetDuration(
  sequence: MotionSequence,
  targetSeconds: number,
  fps: number,
): MotionSequence {
  if (sequence.blocks.length === 0) return sequence;

  const targetFrames = Math.round(targetSeconds * fps);
  const currentFrames = getSequenceDurationInFrames(sequence);
  if (currentFrames <= 0) return sequence;

  const ratio = targetFrames / currentFrames;

  return {
    ...sequence,
    blocks: sequence.blocks.map((block) => ({
      ...block,
      duration: Math.max(MIN_BLOCK_DURATION_FRAMES, Math.round(block.duration * ratio)),
    })),
  };
}

export function buildTimelineItems(sequence: MotionSequence): SequenceTimelineItem[] {
  const items: SequenceTimelineItem[] = [];

  sequence.blocks.forEach((block, index) => {
    items.push({ kind: "block", block, index });
    const transition = getTransitionBetweenBlocks(sequence, index);
    if (transition) {
      items.push({ kind: "transition", transition, afterBlockIndex: index });
    }
  });

  return items;
}

export function getBlockStartFrame(sequence: MotionSequence, blockIndex: number): number {
  let frame = 0;

  for (let i = 0; i < blockIndex; i++) {
    const block = sequence.blocks[i];
    const transition = getTransitionBetweenBlocks(sequence, i);
    const overlap = transition ? Math.round(transition.duration * transition.overlap) : 0;
    frame += block.duration - overlap;
  }

  return frame;
}

export function getBlockPhaseFrames(
  blockDuration: number,
  inRatio: number,
  mainRatio: number,
  outRatio: number,
) {
  const total = inRatio + mainRatio + outRatio;
  const inFrames = Math.round((inRatio / total) * blockDuration);
  const outFrames = Math.round((outRatio / total) * blockDuration);
  const mainFrames = Math.max(blockDuration - inFrames - outFrames, 0);

  return { inFrames, mainFrames, outFrames };
}
