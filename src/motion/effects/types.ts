import type { CSSProperties } from "react";
import type { EffectInstance, EffectTarget, StarterEffectId } from "@/types/effects";

export type { EffectInstance, EffectTarget, StarterEffectId };

export type EffectValueSource = "brand" | "block";

export type ResolvedEffect = {
  effectId: StarterEffectId;
  target: EffectTarget;
  enabled: boolean;
  values: Record<string, unknown>;
  source: EffectValueSource;
  instanceId?: string;
};

export type EffectApplyOptions = {
  reducedMotion?: boolean;
};

export type EffectApplyResult = {
  style: CSSProperties;
  warnings: string[];
};

export type ResolvedTargetEffects = {
  target: EffectTarget;
  effects: ResolvedEffect[];
};
