import type { BrandPreset } from "./brand";
import type { MotionFormat } from "./format";
import type { MotionSequence } from "./sequence";

export type EditorStep = "preset" | "motion" | "edit" | "export";

export type EditorState = {
  step: EditorStep;
  sequence: MotionSequence;
  selectedBlockId: string | null;
  brand: BrandPreset;
  format: MotionFormat;
};

export const EDITOR_FPS = 30;
