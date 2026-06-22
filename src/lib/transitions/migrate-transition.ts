import type { BlockTransition } from "@/types";
import {
  TRANSITION_PRESETS,
  type TransitionPresetId,
} from "@/lib/transitions/presets";

/** Legacy transition definition ids → canonical preset ids. */
const LEGACY_DEFINITION_TO_PRESET: Record<string, TransitionPresetId> = {
  crossfade: "soft-dissolve",
  fade: "soft-dissolve",
  push: "directional-push",
  "mask-reveal": "mask-reveal",
  "scale-through": "scale-handoff",
  "frame-split": "soft-dissolve",
  wipe: "texture-wipe",
  cut: "cut",
};

function isTransitionPresetId(value: string): value is TransitionPresetId {
  return value in TRANSITION_PRESETS;
}

function matchesPresetSignature(
  transition: BlockTransition,
  presetId: TransitionPresetId,
): boolean {
  const preset = TRANSITION_PRESETS[presetId];
  return (
    transition.type === preset.type &&
    transition.duration === preset.defaultDuration &&
    transition.direction === preset.defaultDirection &&
    transition.overlap === preset.defaultOverlap
  );
}

function inferCrossfadePreset(transition: BlockTransition): TransitionPresetId {
  if (transition.overlap >= 0.45 || transition.duration >= 18) {
    return "soft-fade";
  }
  return "soft-dissolve";
}

function inferScaleThroughPreset(transition: BlockTransition): TransitionPresetId {
  if (
    transition.duration >= 20 &&
    transition.overlap >= 0.35
  ) {
    return "scale-fade";
  }
  return "scale-handoff";
}

function inferPushPreset(transition: BlockTransition): TransitionPresetId {
  if (transition.duration >= 20) {
    return transition.direction === "up" ? "slide-up" : "push-left";
  }
  return "directional-push";
}

function inferMaskRevealPreset(transition: BlockTransition): TransitionPresetId {
  if (transition.duration >= 22 && transition.overlap >= 0.32) {
    return "brand-blur";
  }
  return "mask-reveal";
}

/**
 * Infer the preset id for a transition saved without `presetId`.
 * Prefers safe fallbacks — never guesses high-effect presets unless the signature is exact.
 */
export function inferTransitionPresetId(transition: BlockTransition): TransitionPresetId {
  if (transition.presetId && isTransitionPresetId(transition.presetId)) {
    return transition.presetId;
  }

  const exactMatches = (Object.keys(TRANSITION_PRESETS) as TransitionPresetId[]).filter(
    (presetId) => matchesPresetSignature(transition, presetId),
  );

  if (exactMatches.length === 1) {
    return exactMatches[0];
  }

  if (exactMatches.length > 1) {
    const nonCut = exactMatches.find((id) => id !== "cut");
    if (nonCut) return nonCut;
    return exactMatches[0];
  }

  if (transition.type === "cut") {
    if (
      transition.duration <= 6 &&
      transition.overlap > 0 &&
      transition.overlap <= 0.12
    ) {
      return "cut-on-action";
    }
    if (
      transition.duration <= 6 &&
      transition.overlap > 0.12 &&
      transition.overlap <= 0.2
    ) {
      return "match-cut";
    }
    return "cut";
  }

  switch (transition.type) {
    case "crossfade":
      return inferCrossfadePreset(transition);
    case "push":
      return inferPushPreset(transition);
    case "scale-through":
      return inferScaleThroughPreset(transition);
    case "wipe":
      return transition.duration >= 18 ? "wipe" : "texture-wipe";
    case "mask-reveal":
      return inferMaskRevealPreset(transition);
    case "frame-split":
      return "soft-dissolve";
    default:
      return "cut";
  }
}

export function getTransitionPresetId(transition: BlockTransition): TransitionPresetId {
  return inferTransitionPresetId(transition);
}

export function migrateBlockTransition(transition: BlockTransition): BlockTransition {
  const presetId = inferTransitionPresetId(transition);
  if (transition.presetId === presetId) {
    return transition;
  }
  return { ...transition, presetId };
}

export function migrateBlockTransitions(transitions: BlockTransition[]): BlockTransition[] {
  return transitions.map(migrateBlockTransition);
}

export function resolveDefinitionIdToPresetId(definitionId: string): TransitionPresetId {
  if (isTransitionPresetId(definitionId)) {
    return definitionId;
  }
  return LEGACY_DEFINITION_TO_PRESET[definitionId] ?? "cut";
}
