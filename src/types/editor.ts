import type { BrandPreset } from "./brand";
import type { MotionFormat } from "./format";
import type { MotionSequence } from "./sequence";

export type EditorStep = "preset" | "motion" | "edit" | "export";

export type WorkspaceTab = "script" | "timeline" | "blocks" | "brand" | "preview" | "export";

export type MainNavId = "home" | "projects" | "brand-kits" | "templates" | "exports";

export type StudioTab = "review" | "builder" | "system";

export type EditorState = {
  step: EditorStep;
  sequence: MotionSequence;
  selectedBlockId: string | null;
  brand: BrandPreset;
  format: MotionFormat;
};

export const EDITOR_FPS = 30;
