export type EasingName = "linear" | "ease-in" | "ease-out" | "ease-in-out" | "spring";

export type EasingBezier = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

export type EasingCategory =
  | "Standard"
  | "Soft"
  | "Snappy"
  | "Expressive"
  | "Editorial"
  | "Utility"
  | "Overshoot";

export type EasingPreset = {
  id: string;
  name: string;
  description: string;
  category: EasingCategory;
  cssValue: string;
  bezier: EasingBezier | null;
  personality: string;
  recommendedUse: string;
  isCustom: boolean;
};
