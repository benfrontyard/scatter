import type { BlockContent } from "@/types/motion-block";

/** A scene slot inside a video recipe — maps to an editor block type internally. */
export type VideoRecipeScene = {
  blockId: string;
  duration: number;
  content?: Partial<BlockContent>;
  transitionPresetId?: string;
};

/** User-facing video recipe that generates a full project draft. */
export type VideoRecipe = {
  id: string;
  name: string;
  description: string;
  category: string;
  /** Primary use case shown in the create flow. */
  useCase: string;
  /** Compatible format IDs from motionFormats. */
  compatibleFormats: string[];
  /** Default format when none selected. */
  defaultFormatId: string;
  /** Ordered scene sequence. */
  scenes: VideoRecipeScene[];
  /** Suggested project name when applied. */
  suggestedProjectName: string;
  /** Brand kit IDs that pair well with this recipe. */
  recommendedBrandKitIds?: string[];
  /** Whether to apply brand transition defaults on generation. */
  adaptBrandTransitions?: boolean;
};
