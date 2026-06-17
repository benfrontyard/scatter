import type { BrandPreset, MotionSequence, ProjectAsset } from "@/types";

export type EditorSnapshot = {
  sequence: MotionSequence;
  customBrands: BrandPreset[];
  assets: ProjectAsset[];
};

export function createSnapshot(
  sequence: MotionSequence,
  customBrands: BrandPreset[],
  assets: ProjectAsset[],
): EditorSnapshot {
  return {
    sequence: structuredClone(sequence),
    customBrands: structuredClone(customBrands),
    assets: structuredClone(assets),
  };
}

export function snapshotsEqual(a: EditorSnapshot, b: EditorSnapshot): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
