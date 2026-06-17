import type { BrandPreset } from "./brand";
import type { MotionSequence } from "./sequence";

export type ProjectAsset = {
  id: string;
  name: string;
  type: "image";
  dataUrl: string;
};

export type ScatterProject = {
  version: 1;
  id: string;
  name: string;
  savedAt: string;
  sequence: MotionSequence;
  customBrands: BrandPreset[];
  assets: ProjectAsset[];
};

export type RecentProjectEntry = {
  id: string;
  name: string;
  savedAt: string;
};
