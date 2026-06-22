import type { TransitionPresetId } from "@/lib/transitions/presets";
import type { BlockStoryRole } from "@/lib/transitions/sequence-handoffs";

export type BlockHeroAnchor = "center" | "top" | "bottom" | "left" | "right";

export type BlockTransitionPose =
  | "settled-center"
  | "hero-headline"
  | "split-media"
  | "carousel-card"
  | "stat-center"
  | "ui-card"
  | "logo-cta";

export type BlockTransitionMetadata = {
  storyRole?: BlockStoryRole;
  heroAnchor?: BlockHeroAnchor;
  heroGeometryId?: string;
  supportsMatchCut?: boolean;
  supportsCutOnAction?: boolean;
  preferredEntryPose?: BlockTransitionPose;
  preferredExitPose?: BlockTransitionPose;
  compatibleTransitionPresets?: TransitionPresetId[];
  disallowedTransitionPresets?: TransitionPresetId[];
};
