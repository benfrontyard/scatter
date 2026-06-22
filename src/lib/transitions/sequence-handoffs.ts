import {
  blocksShareHeroGeometry,
  canUseCutOnAction,
  canUseMatchCut,
  getBlockTransitionMetadata,
  refinePresetForBlockPair,
} from "@/lib/transitions/block-metadata";
import type { AspectRatioLabel } from "@/lib/transitions/responsive-handoff";
import type { MotionDirection } from "@/remotion/shared-motion";
import { motionBlockMap } from "@/config/blocks";
import { motionFormatMap } from "@/config/formats";
import {
  BRAND_KIT_TRANSITION_DEFAULTS,
  DEFAULT_TRANSITION_PRESET_ID,
  isLegacyTransitionPreset,
  isTransitionPresetCompatible,
  pickSafeFallbackPreset,
  type TransitionPresetId,
} from "@/lib/transitions/presets";

export type BlockStoryRole =
  | "hook"
  | "problem"
  | "reveal"
  | "proof"
  | "detail"
  | "brand-beat"
  | "cta";

const BLOCK_STORY_ROLES: Record<string, BlockStoryRole> = {
  "editorial-statement": "hook",
  "hero-prompt-bar": "hook",
  "feature-announcement": "hook",
  "hero-split-text-media": "reveal",
  "logo-reveal": "reveal",
  "template-carousel": "detail",
  "centered-ui-feature": "detail",
  "card-collage-dof": "detail",
  "big-stat-proof": "proof",
  "stat-card": "proof",
  "brand-payoff": "cta",
  "cta-lockup": "cta",
};

const ROLE_HANDOFF_PRESETS: Partial<Record<string, TransitionPresetId>> = {
  "hook->reveal": "scale-handoff",
  "hook->detail": "cut-on-action",
  "hook->proof": "cut",
  "hook->cta": "cut",

  "problem->reveal": "mask-reveal",
  "problem->detail": "cut-on-action",
  "problem->proof": "cut",

  "reveal->detail": "match-cut",
  "reveal->proof": "match-cut",
  "reveal->brand-beat": "scale-handoff",
  "reveal->cta": "scale-handoff",

  "detail->detail": "match-cut",
  "detail->proof": "match-cut",
  "detail->brand-beat": "texture-wipe",
  "detail->cta": "hold-cut",

  "proof->detail": "match-cut",
  "proof->proof": "match-cut",
  "proof->cta": "hold-cut",

  "brand-beat->reveal": "mask-reveal",
  "brand-beat->detail": "scale-handoff",
  "brand-beat->cta": "cut",

  "cta->cta": "hold-cut",
};

export function getBlockStoryRole(blockId: string): BlockStoryRole {
  return BLOCK_STORY_ROLES[blockId] ?? "detail";
}

function getSharedCompatibleTransitions(fromBlockId: string, toBlockId: string): string[] {
  const fromCompatible = motionBlockMap[fromBlockId]?.compatibleTransitions ?? [];
  const toCompatible = motionBlockMap[toBlockId]?.compatibleTransitions ?? [];
  return fromCompatible.filter((id) => toCompatible.includes(id));
}

function finalizePreset(
  presetId: TransitionPresetId,
  fromBlockId: string,
  toBlockId: string,
  brandPresetId?: string,
  options?: PickTransitionOptions,
): TransitionPresetId {
  const shared = getSharedCompatibleTransitions(fromBlockId, toBlockId);
  const refined = refinePresetForBlockPair(presetId, fromBlockId, toBlockId, options);

  if (isTransitionPresetCompatible(refined, shared)) {
    return refined;
  }

  return pickSafeFallbackPreset(shared, brandPresetId);
}

export type PickTransitionOptions = {
  aspectRatio?: AspectRatioLabel;
  direction?: MotionDirection;
};

export function pickRoleAwareTransitionId(
  fromBlockId: string,
  toBlockId: string,
  brandPresetId?: string,
  options?: PickTransitionOptions,
): TransitionPresetId | undefined {
  const fromRole = getBlockStoryRole(fromBlockId);
  const toRole = getBlockStoryRole(toBlockId);
  const roleKey = `${fromRole}->${toRole}`;
  const rolePreset = ROLE_HANDOFF_PRESETS[roleKey];

  if (!rolePreset) return undefined;

  return finalizePreset(rolePreset, fromBlockId, toBlockId, brandPresetId, options);
}

export function pickTransitionPresetForBlockPair(
  fromBlockId: string,
  toBlockId: string,
  brandPresetId?: string,
  options?: PickTransitionOptions,
): TransitionPresetId {
  const rolePreset = pickRoleAwareTransitionId(fromBlockId, toBlockId, brandPresetId, options);
  if (rolePreset) return rolePreset;

  const shared = getSharedCompatibleTransitions(fromBlockId, toBlockId);

  const brandDefault =
    (brandPresetId ? BRAND_KIT_TRANSITION_DEFAULTS[brandPresetId]?.preset : undefined) ??
    DEFAULT_TRANSITION_PRESET_ID;

  if (
    !isLegacyTransitionPreset(brandDefault) &&
    isTransitionPresetCompatible(brandDefault, shared)
  ) {
    return finalizePreset(brandDefault, fromBlockId, toBlockId, brandPresetId, options);
  }

  if (canUseMatchCut(fromBlockId, toBlockId) && shared.includes("cut")) {
    return finalizePreset("match-cut", fromBlockId, toBlockId, brandPresetId, options);
  }

  return pickSafeFallbackPreset(shared, brandPresetId);
}

export function pickTransitionPresetForSequencePair(
  fromBlockId: string,
  toBlockId: string,
  sequence: { brandPresetId?: string; format?: string },
  direction?: MotionDirection,
): TransitionPresetId {
  const aspectRatio = sequence.format
    ? motionFormatMap[sequence.format]?.aspectRatio
    : undefined;
  return pickTransitionPresetForBlockPair(fromBlockId, toBlockId, sequence.brandPresetId, {
    aspectRatio,
    direction,
  });
}

export {
  blocksShareHeroGeometry,
  canUseCutOnAction,
  canUseMatchCut,
  getBlockTransitionMetadata,
};
