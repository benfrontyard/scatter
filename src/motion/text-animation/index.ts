export type { ResolveTextAnimationOptions } from "./resolveTextAnimation";

export {
  hasTextAnimation,
  resolveTextAnimation,
  getResolvedEasingFunction,
} from "./resolveTextAnimation";

export {
  applyUnitStyle,
  applyTextAnimationAtFrame,
} from "./applyTextAnimation";

export {
  computeUnitTimings,
  getSelectorOrder,
  getUnitProgress,
} from "./selector";

export {
  applyBrandModifiersToProperties,
  applyBrandModifiersToSelector,
  getBrandMotionMultipliers,
  getReducedMotionProperties,
  getReducedMotionSelector,
} from "./brand-modifiers";
