import type { PostFXQuality } from "@/types/post-fx";

/** Mutable preview state read by Remotion composition — avoids Player inputProps churn */
export const previewDisplayState = {
  isPlaying: false,
  effectiveQuality: "medium" as PostFXQuality,
};
