import { motionBlockMap } from "@/config/blocks";
import type { BlockTransitionMetadata } from "@/types/block-transition";
import type { TransitionPresetId } from "@/lib/transitions/presets";
import {
  isDirectionalPushSafe,
  type AspectRatioLabel,
} from "@/lib/transitions/responsive-handoff";
import type { MotionDirection } from "@/remotion/shared-motion";

/** Per-block transition choreography metadata for wave-1 and core blocks. */
export const BLOCK_TRANSITION_METADATA: Record<string, BlockTransitionMetadata> = {
  "editorial-statement": {
    heroAnchor: "center",
    heroGeometryId: "headline-center",
    supportsMatchCut: false,
    supportsCutOnAction: true,
    preferredEntryPose: "hero-headline",
    preferredExitPose: "hero-headline",
    compatibleTransitionPresets: ["cut", "scale-handoff", "cut-on-action", "mask-reveal"],
  },
  "hero-prompt-bar": {
    heroAnchor: "center",
    heroGeometryId: "headline-center",
    supportsMatchCut: false,
    supportsCutOnAction: true,
    preferredEntryPose: "hero-headline",
    preferredExitPose: "hero-headline",
  },
  "feature-announcement": {
    heroAnchor: "center",
    heroGeometryId: "split-media",
    supportsMatchCut: true,
    supportsCutOnAction: true,
    preferredEntryPose: "split-media",
    preferredExitPose: "split-media",
  },
  "hero-split-text-media": {
    heroAnchor: "left",
    heroGeometryId: "split-media",
    supportsMatchCut: true,
    supportsCutOnAction: true,
    preferredEntryPose: "split-media",
    preferredExitPose: "split-media",
  },
  "template-carousel": {
    heroAnchor: "center",
    heroGeometryId: "center-hero",
    supportsMatchCut: true,
    supportsCutOnAction: true,
    preferredEntryPose: "carousel-card",
    preferredExitPose: "carousel-card",
  },
  "centered-ui-feature": {
    heroAnchor: "center",
    heroGeometryId: "ui-card",
    supportsMatchCut: true,
    supportsCutOnAction: true,
    preferredEntryPose: "ui-card",
    preferredExitPose: "ui-card",
  },
  "card-collage-dof": {
    heroAnchor: "center",
    heroGeometryId: "center-hero",
    supportsMatchCut: true,
    supportsCutOnAction: true,
    preferredEntryPose: "carousel-card",
    preferredExitPose: "carousel-card",
  },
  "big-stat-proof": {
    heroAnchor: "center",
    heroGeometryId: "center-hero",
    supportsMatchCut: true,
    supportsCutOnAction: false,
    preferredEntryPose: "stat-center",
    preferredExitPose: "stat-center",
  },
  "stat-card": {
    heroAnchor: "center",
    heroGeometryId: "center-hero",
    supportsMatchCut: true,
    supportsCutOnAction: false,
    preferredEntryPose: "stat-center",
    preferredExitPose: "stat-center",
  },
  "brand-payoff": {
    heroAnchor: "center",
    heroGeometryId: "logo-cta",
    supportsMatchCut: true,
    supportsCutOnAction: false,
    preferredEntryPose: "logo-cta",
    preferredExitPose: "logo-cta",
  },
  "cta-lockup": {
    heroAnchor: "center",
    heroGeometryId: "logo-cta",
    supportsMatchCut: true,
    supportsCutOnAction: false,
    preferredEntryPose: "logo-cta",
    preferredExitPose: "logo-cta",
  },
  "logo-reveal": {
    heroAnchor: "center",
    heroGeometryId: "logo-cta",
    supportsMatchCut: true,
    supportsCutOnAction: false,
    preferredEntryPose: "logo-cta",
    preferredExitPose: "logo-cta",
  },
};

export function getBlockTransitionMetadata(blockId: string): BlockTransitionMetadata {
  const definition = motionBlockMap[blockId];
  return {
    ...BLOCK_TRANSITION_METADATA[blockId],
    ...definition?.transitionMetadata,
  };
}

export function blocksShareHeroGeometry(fromBlockId: string, toBlockId: string): boolean {
  const from = getBlockTransitionMetadata(fromBlockId);
  const to = getBlockTransitionMetadata(toBlockId);
  if (!from.heroGeometryId || !to.heroGeometryId) return false;
  return from.heroGeometryId === to.heroGeometryId;
}

export function canUseMatchCut(fromBlockId: string, toBlockId: string): boolean {
  const from = getBlockTransitionMetadata(fromBlockId);
  const to = getBlockTransitionMetadata(toBlockId);
  if (from.supportsMatchCut === false || to.supportsMatchCut === false) return false;

  if (blocksShareHeroGeometry(fromBlockId, toBlockId)) return true;

  // Center-hero family: carousel/card detail → centered stat/proof
  const fromRole = from.preferredExitPose;
  const toRole = to.preferredEntryPose;
  if (
    from.heroGeometryId === "center-hero" &&
    to.heroGeometryId === "center-hero" &&
    (fromRole === "carousel-card" || fromRole === "stat-center") &&
    (toRole === "stat-center" || toRole === "carousel-card")
  ) {
    return true;
  }

  return false;
}

export function canUseCutOnAction(fromBlockId: string, toBlockId: string): boolean {
  const from = getBlockTransitionMetadata(fromBlockId);
  const to = getBlockTransitionMetadata(toBlockId);
  if (from.supportsCutOnAction === false || to.supportsCutOnAction === false) return false;
  return (
    from.preferredExitPose === to.preferredEntryPose ||
    blocksShareHeroGeometry(fromBlockId, toBlockId) ||
    (from.heroAnchor === to.heroAnchor && from.heroAnchor !== undefined)
  );
}

export function isPresetAllowedForBlockPair(
  presetId: TransitionPresetId,
  fromBlockId: string,
  toBlockId: string,
): boolean {
  const from = getBlockTransitionMetadata(fromBlockId);
  const to = getBlockTransitionMetadata(toBlockId);
  if (from.disallowedTransitionPresets?.includes(presetId)) return false;
  if (to.disallowedTransitionPresets?.includes(presetId)) return false;
  const allowed = [...(from.compatibleTransitionPresets ?? []), ...(to.compatibleTransitionPresets ?? [])];
  if (allowed.length === 0) return true;
  return allowed.includes(presetId);
}

export function refinePresetForBlockPair(
  presetId: TransitionPresetId,
  fromBlockId: string,
  toBlockId: string,
  options?: {
    aspectRatio?: AspectRatioLabel;
    direction?: MotionDirection;
  },
): TransitionPresetId {
  if (!isPresetAllowedForBlockPair(presetId, fromBlockId, toBlockId)) {
    return canUseMatchCut(fromBlockId, toBlockId) ? "match-cut" : "cut";
  }

  if (
    presetId === "directional-push" &&
    options?.aspectRatio &&
    !isDirectionalPushSafe(options.aspectRatio, options.direction ?? "left")
  ) {
    return canUseMatchCut(fromBlockId, toBlockId)
      ? "match-cut"
      : canUseCutOnAction(fromBlockId, toBlockId)
        ? "cut-on-action"
        : "scale-handoff";
  }

  if (presetId === "match-cut" && !canUseMatchCut(fromBlockId, toBlockId)) {
    return canUseCutOnAction(fromBlockId, toBlockId) ? "cut-on-action" : "scale-handoff";
  }

  if (presetId === "cut-on-action" && !canUseCutOnAction(fromBlockId, toBlockId)) {
    return canUseMatchCut(fromBlockId, toBlockId) ? "match-cut" : "cut";
  }

  return presetId;
}
