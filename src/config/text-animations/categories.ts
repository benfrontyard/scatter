import type { TextAnimationCategory } from "@/types/text-animation";

export const TEXT_ANIMATION_CATEGORY_LABELS: Record<TextAnimationCategory, string> = {
  subtle: "Subtle",
  editorial: "Editorial",
  kinetic: "Kinetic",
  flick: "Flick",
  premium: "Premium",
  utility: "Utility",
};

export const TEXT_ANIMATION_CATEGORIES: TextAnimationCategory[] = [
  "subtle",
  "editorial",
  "kinetic",
  "flick",
  "premium",
  "utility",
];
