import type { BlockMotionControls, BlockMotionDefaults, BlockMotionPhases } from "@/types";

export function getMotionPhases(motion: BlockMotionDefaults): BlockMotionPhases {
  return motion.phases;
}

export function getMotionControls(motion: BlockMotionDefaults): BlockMotionControls {
  return motion.controls;
}

export function formatMotionControlLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase());
}

export function formatContentLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase());
}
