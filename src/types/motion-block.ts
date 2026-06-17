export type MotionBehaviorName =
  | "fade"
  | "slide-up"
  | "slide-down"
  | "scale-in"
  | "hold"
  | "fade-out"
  | "slide-out";

export type BlockCategory = "intro" | "product" | "proof" | "cta" | "logo";

export type BlockContent = Record<string, string>;

export type BlockMotionPhases = {
  in: MotionBehaviorName;
  main: MotionBehaviorName;
  out: MotionBehaviorName;
  inRatio: number;
  mainRatio: number;
  outRatio: number;
};

export type BlockMotionControls = Record<string, number | string>;

export type BlockMotionDefaults = {
  phases: BlockMotionPhases;
  controls: BlockMotionControls;
  /** Optional per-block easing override */
  easingId?: string;
};

export type MotionBlockDefinition = {
  id: string;
  name: string;
  category: BlockCategory;
  description: string;
  defaultDuration: number;
  defaultContent: BlockContent;
  defaultMotion: BlockMotionDefaults;
  supportedFormats: string[];
  compatibleTransitions: string[];
};

export type MotionBlockInstance = {
  id: string;
  blockId: string;
  duration: number;
  content: BlockContent;
  motion: BlockMotionDefaults;
};
