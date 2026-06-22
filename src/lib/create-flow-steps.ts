import {
  CREATE_FLOW_STEPS,
  type CreateFlowDraft,
  type CreateFlowStep,
  type CreatePath,
} from "@/types/create-flow";

const STEP_MAP = Object.fromEntries(CREATE_FLOW_STEPS.map((step) => [step.id, step])) as Record<
  CreateFlowStep,
  (typeof CREATE_FLOW_STEPS)[number]
>;

/** Steps shown after a creation path is chosen (excludes the path picker). */
export function getActiveCreateFlowStepIds(path: CreatePath): CreateFlowStep[] {
  switch (path) {
    case "scratch":
      return ["brand", "formats", "generate"];
    case "duplicate":
      return ["brand", "recipe", "formats", "generate"];
    case "brief":
    case "template":
      return ["brand", "content", "recipe", "formats", "generate"];
    default:
      return CREATE_FLOW_STEPS.map((step) => step.id);
  }
}

export function getCreateFlowSteps(path: CreatePath | null) {
  if (!path) {
    return [STEP_MAP.path];
  }
  return getActiveCreateFlowStepIds(path).map((id) => STEP_MAP[id]);
}

export function getInitialCreateFlowStep(path: CreatePath | null): CreateFlowStep {
  return path ? getActiveCreateFlowStepIds(path)[0]! : "path";
}

export function getCreatePathLabel(path: CreatePath | null): string {
  switch (path) {
    case "brief":
      return "From brief";
    case "template":
      return "Video recipe";
    case "scratch":
      return "Blank canvas";
    case "duplicate":
      return "Duplicate project";
    default:
      return "Create video";
  }
}

export function getCreateFlowSummary(draft: CreateFlowDraft): string {
  const parts: string[] = [];
  if (draft.path) parts.push(getCreatePathLabel(draft.path));
  if (draft.brandKitId) parts.push(draft.brandKitId);
  if (draft.recipeId && draft.recipeId !== "blank") parts.push(draft.recipeId);
  if (draft.formatIds[0]) parts.push(draft.formatIds[0].replace("format-", ""));
  return parts.join(" · ");
}
