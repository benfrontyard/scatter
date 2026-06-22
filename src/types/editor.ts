import type { BrandPreset } from "./brand";
import type { MotionFormat } from "./format";
import type { MotionSequence } from "./sequence";

/** Top-level application shell — determines which major surface is shown. */
export type AppShell = "home" | "createFlow" | "editor" | "studio";

export type EditorStep = "preset" | "motion" | "edit" | "export";

export type WorkspaceTab = "script" | "timeline" | "blocks" | "brand" | "preview" | "export";

export type MainNavId = "home" | "projects" | "brand-kits" | "templates" | "exports";

export type StudioTab = "blocks" | "brand-lab" | "diagnostics";

export type EditorState = {
  step: EditorStep;
  sequence: MotionSequence;
  selectedBlockId: string | null;
  brand: BrandPreset;
  format: MotionFormat;
};

export const EDITOR_FPS = 30;

export type { CreateFlowDraft, CreateFlowStep, CreatePath } from "./create-flow";
export { DEFAULT_CREATE_FLOW_DRAFT, CREATE_FLOW_STEPS } from "./create-flow";
export type { VideoRecipe, VideoRecipeScene } from "./video-recipe";
