import { studioBrandPresetMap } from "@/lib/brand-motion-kit-adapter";
import type { BlockContent } from "@/types/motion-block";
import { transitionDefinitionMap } from "@/config/transitions";
import { applyBrandMotionKitToProject } from "@/lib/brand-motion-kit-integration";
import { buildEmptySequence } from "@/lib/empty-sequence";
import { loadProject } from "@/lib/project-storage";
import { createBlockInstance, createTransitionBetween } from "@/lib/sequence-factory";
import { legacyEasingToId } from "@/lib/easing";
import type { CreateFlowDraft } from "@/types/create-flow";
import type { BrandPreset, ScatterProject } from "@/types";
import { getVideoRecipe } from "./catalog";

function applyBrandKitIdToProject(
  brandKitId: string,
  project: ScatterProject,
  options?: { updateTransitions?: boolean; sessionCustomBrands?: BrandPreset[] },
): ScatterProject {
  const sessionCustom = options?.sessionCustomBrands?.find((b) => b.id === brandKitId);
  if (sessionCustom) {
    const customBrands = project.customBrands.filter((b) => b.id !== brandKitId);
    customBrands.push(sessionCustom);
    return {
      ...project,
      sequence: { ...project.sequence, brandPresetId: brandKitId },
      customBrands,
    };
  }

  if (studioBrandPresetMap[brandKitId]) {
    return applyBrandMotionKitToProject(brandKitId, project, options);
  }

  return project;
}

function applyBriefToContent(
  brief: string,
  scenes: ReturnType<typeof createBlockInstance>[],
): ReturnType<typeof createBlockInstance>[] {
  if (!brief.trim()) return scenes;
  const first = scenes[0];
  if (!first) return scenes;

  const headline =
    brief.length > 80 ? `${brief.slice(0, 77).trim()}…` : brief.trim();

  return scenes.map((scene, index) => {
    if (index !== 0) return scene;
    return {
      ...scene,
      content: {
        ...scene.content,
        headline: scene.content.headline || headline,
        subhead: scene.content.subhead || "",
      },
    };
  });
}

export function generateProjectFromCreateFlow(
  draft: CreateFlowDraft,
  sessionCustomBrands: BrandPreset[] = [],
): ScatterProject {
  if (draft.path === "duplicate" && draft.sourceProjectId) {
    const source = loadProject(draft.sourceProjectId);
    if (source) {
      const duplicated: ScatterProject = {
        ...structuredClone(source),
        id: crypto.randomUUID(),
        name: draft.projectName || `${source.name} (copy)`,
        savedAt: new Date().toISOString(),
      };
      if (draft.brandKitId) {
        return applyBrandKitIdToProject(draft.brandKitId, duplicated, {
          sessionCustomBrands,
        });
      }
      return duplicated;
    }
  }

  const recipe = draft.recipeId ? getVideoRecipe(draft.recipeId) : undefined;
  const projectName =
    draft.projectName ||
    recipe?.suggestedProjectName ||
    (draft.path === "scratch" ? "Untitled video" : "New video");

  const primaryFormat =
    draft.formatIds[0] ?? recipe?.defaultFormatId ?? "format-16-9";

  let sequence = buildEmptySequence(projectName);
  sequence = { ...sequence, format: primaryFormat };

  if (recipe && recipe.scenes.length > 0) {
    const blocks = recipe.scenes.map((scene) =>
      createBlockInstance(scene.blockId, {
        duration: scene.duration,
        content: scene.content as BlockContent | undefined,
      }),
    );

    const blocksWithBrief = applyBriefToContent(draft.brief, blocks);

    const transitions = [];
    for (let i = 0; i < blocksWithBrief.length - 1; i++) {
      const fromBlock = blocksWithBrief[i]!;
      const toBlock = blocksWithBrief[i + 1]!;
      const presetId = recipe.scenes[i]?.transitionPresetId ?? "match-cut";
      const def = transitionDefinitionMap[presetId];
      transitions.push(
        createTransitionBetween(fromBlock, toBlock, presetId, {
          type: def?.type,
          duration: def?.defaultDuration,
          direction: def?.defaultDirection,
          overlap: def?.defaultOverlap,
          easingId: def?.defaultEasingId ?? legacyEasingToId("ease-out"),
        }),
      );
    }

    sequence = {
      ...sequence,
      blocks: blocksWithBrief,
      transitions,
    };
  }

  let project: ScatterProject = {
    version: 1,
    id: crypto.randomUUID(),
    name: projectName,
    savedAt: new Date().toISOString(),
    sequence,
    customBrands: [],
    assets: [],
  };

  if (draft.brandKitId) {
    project = applyBrandKitIdToProject(draft.brandKitId, project, {
      updateTransitions: recipe?.adaptBrandTransitions !== false,
      sessionCustomBrands,
    });
  }

  return project;
}
