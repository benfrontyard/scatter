import type { TextAlign } from "./typography";
import type { TypeDensity } from "./typography-role";

export type CompositionStyle =
  | "swiss"
  | "editorial"
  | "premium"
  | "product"
  | "social"
  | "expressive";

export type GridStrength = "strict" | "balanced" | "loose" | "expressive";

export type AlignmentMode = "left" | "center" | "mixed";

export type LayoutDensity = TypeDensity;

export type SafeAreaPreset = "tight" | "standard" | "generous";

export type MotionComposition = "stable" | "dynamic" | "cinematic";

export type LayoutZone =
  | "center"
  | "top-left"
  | "top-center"
  | "bottom-left"
  | "bottom-center"
  | "split-left"
  | "split-right"
  | "upper-third"
  | "lower-third"
  | "center-safe";

export type MediaPosition =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "background"
  | "inline";

export type StackDirection = "column" | "row";

export type BrandComposition = {
  style: CompositionStyle;
  gridStrength: GridStrength;
  defaultAlignment: AlignmentMode;
  density: LayoutDensity;
  safeArea: SafeAreaPreset;
  motionComposition: MotionComposition;
  allowGridBreaks: boolean;
};

export type ResolvedSafeArea = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type ResolvedLayoutZone = {
  zone: LayoutZone;
  x: number;
  y: number;
  width: number;
  height: number;
  alignItems: "flex-start" | "center" | "flex-end";
  justifyContent: "flex-start" | "center" | "flex-end";
  textAlign: TextAlign;
};
