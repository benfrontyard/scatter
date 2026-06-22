export type CreatePath = "brief" | "template" | "scratch" | "duplicate";

export type CreateFlowStep =
  | "path"
  | "brand"
  | "content"
  | "recipe"
  | "formats"
  | "generate";

export type CreateFlowDraft = {
  path: CreatePath | null;
  projectName: string;
  brandKitId: string | null;
  brief: string;
  recipeId: string | null;
  sourceProjectId: string | null;
  formatIds: string[];
};

export const CREATE_FLOW_STEPS: { id: CreateFlowStep; label: string }[] = [
  { id: "path", label: "Creation path" },
  { id: "brand", label: "Brand kit" },
  { id: "content", label: "Content" },
  { id: "recipe", label: "Video recipe" },
  { id: "formats", label: "Formats" },
  { id: "generate", label: "Generate draft" },
];

export const DEFAULT_CREATE_FLOW_DRAFT: CreateFlowDraft = {
  path: null,
  projectName: "",
  brandKitId: null,
  brief: "",
  recipeId: null,
  sourceProjectId: null,
  formatIds: ["format-16-9"],
};
