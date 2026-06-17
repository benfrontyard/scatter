import type { EffectInheritanceCategory, EffectTarget } from "@/types/effects";

export type BlockEffectTarget = {
  key: EffectTarget;
  label: string;
  inherits: EffectInheritanceCategory[];
};

export const blockEffectTargets: Record<string, BlockEffectTarget[]> = {
  "feature-announcement": [
    { key: "background", label: "Background", inherits: ["background"] },
    { key: "headline", label: "Headline", inherits: ["text"] },
    { key: "subhead", label: "Subhead", inherits: ["text"] },
    { key: "image", label: "Image", inherits: ["image"] },
    { key: "logo", label: "Logo", inherits: ["logo"] },
  ],
  "stat-card": [
    { key: "background", label: "Background", inherits: ["background"] },
    { key: "number", label: "Stat value", inherits: ["text"] },
    { key: "label", label: "Label", inherits: ["text"] },
    { key: "card", label: "Card", inherits: ["card"] },
  ],
  "logo-reveal": [
    { key: "logo", label: "Logo", inherits: ["logo"] },
    { key: "background", label: "Background", inherits: ["background"] },
  ],
  "cta-lockup": [
    { key: "background", label: "Background", inherits: ["background"] },
    { key: "card", label: "Card", inherits: ["card"] },
    { key: "cta", label: "CTA button", inherits: ["text", "card"] },
    { key: "logo", label: "Logo", inherits: ["logo"] },
  ],
};

const FALLBACK_INHERITANCE: Partial<Record<EffectTarget, EffectInheritanceCategory[]>> = {
  block: ["card"],
  text: ["text"],
  image: ["image"],
  logo: ["logo"],
  background: ["background"],
  shape: ["card"],
  group: ["card"],
  card: ["card"],
  headline: ["text"],
  subhead: ["text"],
  cta: ["text", "card"],
  number: ["text"],
  label: ["text"],
};

export function getBlockEffectTargets(blockId: string): BlockEffectTarget[] {
  return blockEffectTargets[blockId] ?? [];
}

export function getTargetInheritanceCategories(target: EffectTarget): EffectInheritanceCategory[] {
  for (const targets of Object.values(blockEffectTargets)) {
    const match = targets.find((entry) => entry.key === target);
    if (match) return match.inherits;
  }
  return FALLBACK_INHERITANCE[target] ?? [];
}

export function getBlockEffectTargetKeys(blockId: string): EffectTarget[] {
  return getBlockEffectTargets(blockId).map((target) => target.key);
}
