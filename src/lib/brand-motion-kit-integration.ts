/**
 * Brand Motion Kit integration — connects Studio / Brand Lab demo kits to the main editor.
 */

import {
  brandMotionKitToBrandPreset,
  studioBrandPresets,
  studioBrandPresetMap,
} from "@/lib/brand-motion-kit-adapter";
import { fakeBrandKitByName, fakeBrandKits } from "@/data/fakeBrands";
import { transitionDefinitionMap } from "@/config/transitions";
import { createTransitionBetween } from "@/lib/sequence-factory";
import {
  BRAND_KIT_TRANSITION_DEFAULTS,
} from "@/lib/transitions/presets";
import { pickTransitionPresetForSequencePair } from "@/lib/transitions/sequence-handoffs";
import type { BrandPreset, MotionSequence, ScatterProject } from "@/types";

export { studioBrandPresets, studioBrandPresetMap, brandMotionKitToBrandPreset };

export type ExampleBrandKit = {
  id: string;
  name: string;
  description: string;
  colors: string[];
  typeSample: string;
  motionStyle: string;
  preset: BrandPreset;
};

/** Demo kits surfaced in the main editor Brand Kit modal. */
export const exampleBrandKits: ExampleBrandKit[] = fakeBrandKits.map((kit) => {
  const preset = brandMotionKitToBrandPreset(kit);
  const colors = [
    kit.identity.colors.primary?.hex,
    kit.identity.colors.accent?.hex,
    kit.identity.colors.background?.hex,
    kit.identity.colors.muted?.hex,
  ].filter(Boolean) as string[];

  return {
    id: preset.id,
    name: kit.name,
    description: kit.description,
    colors,
    typeSample: kit.identity.typography.heading.family,
    motionStyle: kit.motionKit.motionPersonality,
    preset,
  };
});

export function getExampleBrandKit(id: string): ExampleBrandKit | undefined {
  return exampleBrandKits.find((k) => k.id === id);
}

export function applyBrandMotionKitToProject(
  kitId: string,
  project: ScatterProject,
  options?: { updateTransitions?: boolean },
): ScatterProject {
  const kit = fakeBrandKits.find((k) => k.name.toLowerCase() === kitId) ?? fakeBrandKitByName[kitId as keyof typeof fakeBrandKitByName];
  if (!kit) return project;

  const preset = brandMotionKitToBrandPreset(kit);
  const brandDefaults = BRAND_KIT_TRANSITION_DEFAULTS[preset.id];

  let sequence: MotionSequence = {
    ...project.sequence,
    brandPresetId: preset.id,
  };

  const customBrands = project.customBrands.filter((b) => b.id !== preset.id);
  customBrands.push(preset);

  if (options?.updateTransitions !== false && sequence.blocks.length > 1) {
    const transitions = [];
    for (let i = 0; i < sequence.blocks.length - 1; i++) {
      const fromBlock = sequence.blocks[i]!;
      const toBlock = sequence.blocks[i + 1]!;
      const transitionPresetId = pickTransitionPresetForSequencePair(
        fromBlock.blockId,
        toBlock.blockId,
        sequence,
      );
      const def = transitionDefinitionMap[transitionPresetId];
      transitions.push(
        createTransitionBetween(fromBlock, toBlock, transitionPresetId, {
          type: def?.type,
          duration: def?.defaultDuration,
          direction: def?.defaultDirection,
          overlap: def?.defaultOverlap,
          easingId: brandDefaults?.easingId ?? def?.defaultEasingId,
        }),
      );
    }
    sequence = { ...sequence, transitions };
  }

  return {
    ...project,
    sequence,
    customBrands,
  };
}

export function applyBrandMotionPresetToBlock(_presetId: string, _blockId: string): void {
  // Reserved for template preset application from Brand Lab.
}

export function saveBlockAsBrandPreset(_blockId: string, _kitId: string): void {
  // Reserved for persisting block overrides as brand presets.
}

export function resetBlockToBrandDefault(_blockId: string): void {
  // Reserved for clearing block-level brand overrides.
}

export function openKitInBrandLab(kitId: string): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("scatter:open-brand-lab", { detail: { kitId } }),
    );
  }
}
