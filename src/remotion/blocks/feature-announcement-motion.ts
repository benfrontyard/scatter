import type { MotionSpeed } from "../shared-motion";
import { getSpeedFactor } from "../shared-motion";

export {
  getEnterProgress,
  getFadeOpacity,
  getMaskReveal,
  getOutroOpacity,
  getScale,
  getTranslate,
  parseMotionDirection,
  parseMotionIntensity,
  parseMotionSpeed,
  resolveBlockMotionParams,
} from "../shared-motion";

export type { MotionDirection, MotionIntensity, MotionSpeed } from "../shared-motion";

export function getFeatureAnnouncementTiming(
  duration: number,
  stagger: number,
  speed: MotionSpeed,
) {
  const speedFactor = getSpeedFactor(speed);
  const introFrames = Math.round(duration * 0.42 * speedFactor);
  const enterFrames = Math.max(Math.round(introFrames * 0.55), 12);

  const backgroundStart = 0;
  const headlineStart = Math.round(enterFrames * 0.15);
  const subheadStart = headlineStart + stagger;
  const imageStart = subheadStart + stagger;
  const logoStart = Math.round(duration * 0.68);

  return {
    enterFrames,
    backgroundStart,
    headlineStart,
    subheadStart,
    imageStart,
    logoStart,
  };
}
