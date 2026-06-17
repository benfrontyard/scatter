import type { MotionBlockInstance } from "./motion-block";
import type { BlockTransition } from "./transition";

export type ProjectTypography = {
  /** Base font weight for headings (400–800) */
  weight?: number;
  /** Global size scale multiplier */
  size?: number;
  /** Letter-spacing offset in em added to block defaults */
  tracking?: number;
};

export type MotionSequence = {
  id: string;
  name: string;
  format: string;
  brandPresetId: string;
  typography?: ProjectTypography;
  canvasBackground?: string;
  fps?: number;
  logoText?: string;
  blocks: MotionBlockInstance[];
  transitions: BlockTransition[];
};

export type SequenceTimelineItem =
  | { kind: "block"; block: MotionBlockInstance; index: number }
  | { kind: "transition"; transition: BlockTransition; afterBlockIndex: number };
