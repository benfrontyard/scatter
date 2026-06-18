import { defaultMotionSequence } from "@/config/sequences/default";
import { CUSTOM_BRAND_ID, duplicateBrandAsCustom, resolveBrand } from "@/lib/brand-utils";
import { normalizeBlockEffects, normalizeBrandEffects } from "@/lib/effects";
import { normalizePostFXSettings } from "@/lib/post-fx";
import { normalizeCameraSettings } from "@/lib/camera";
import { normalizeBlockTextAnimations } from "@/lib/text-animation";
import { normalizeBrandColors } from "@/lib/brand-colors";
import { normalizeBrandTypography } from "@/lib/typography";
import type { BrandPreset, MotionBlockInstance, MotionSequence, ScatterProject, RecentProjectEntry } from "@/types";

const PROJECTS_KEY = "scatter:projects";
const RECENT_KEY = "scatter:recent";
const MAX_RECENT = 8;

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function createNewProject(name = "Untitled Project"): ScatterProject {
  return {
    version: 1,
    id: crypto.randomUUID(),
    name,
    savedAt: new Date().toISOString(),
    sequence: structuredClone(defaultMotionSequence),
    customBrands: [],
    assets: [],
  };
}

export function projectToJson(project: ScatterProject): string {
  return JSON.stringify(project, null, 2);
}

function migrateCustomBrands(customBrands: BrandPreset[]): BrandPreset[] {
  return customBrands.map((brand) => ({
    ...brand,
    colors: normalizeBrandColors(brand.colors),
    typography: normalizeBrandTypography(brand.typography),
    effects: normalizeBrandEffects(brand.effects),
  }));
}

function migrateBlockEffects(blocks: MotionBlockInstance[]): MotionBlockInstance[] {
  return blocks.map((block) => ({
    ...block,
    effects: normalizeBlockEffects(block.effects),
    textAnimations: normalizeBlockTextAnimations(block.textAnimations),
  }));
}

function migrateProject(project: ScatterProject): ScatterProject {
  const legacyFont = (project.sequence as MotionSequence & { fontFamily?: string }).fontFamily;
  const legacyTypography = (project.sequence as MotionSequence & { typography?: unknown })
    .typography;
  const { fontFamily: _fontFamily, typography: _typography, ...sequence } =
    project.sequence as MotionSequence & {
      fontFamily?: string;
      typography?: unknown;
    };

  let customBrands = migrateCustomBrands(project.customBrands);
  let brandPresetId = sequence.brandPresetId;

  if (legacyFont) {
    const existingCustom = customBrands.find((brand) => brand.id === CUSTOM_BRAND_ID);
    if (existingCustom) {
      customBrands = customBrands.map((brand) =>
        brand.id === CUSTOM_BRAND_ID
          ? {
              ...brand,
              typography: normalizeBrandTypography({
                ...brand.typography,
                fontFamilies: {
                  ...brand.typography.fontFamilies,
                  heading: legacyFont,
                  body: legacyFont,
                },
              }),
            }
          : brand,
      );
    } else {
      const baseBrand = resolveBrand(sequence.brandPresetId, customBrands);
      customBrands = [
        ...customBrands,
        {
          ...duplicateBrandAsCustom(baseBrand),
          typography: normalizeBrandTypography({
            fontFamilies: { heading: legacyFont, body: legacyFont },
          }),
        },
      ];
    }
    brandPresetId = CUSTOM_BRAND_ID;
  }

  void legacyTypography;

  return {
    ...project,
    sequence: {
      ...sequence,
      brandPresetId,
      blocks: migrateBlockEffects(sequence.blocks),
      postFx: normalizePostFXSettings(sequence.postFx),
      camera: normalizeCameraSettings(sequence.camera),
    },
    customBrands,
  };
}

export function parseProjectJson(json: string): ScatterProject {
  const parsed = JSON.parse(json) as ScatterProject;
  if (!parsed.version || !parsed.sequence) {
    throw new Error("Invalid project file.");
  }
  return migrateProject({
    ...parsed,
    customBrands: parsed.customBrands ?? [],
    assets: parsed.assets ?? [],
  });
}

export function saveProject(project: ScatterProject): ScatterProject {
  const updated: ScatterProject = {
    ...project,
    savedAt: new Date().toISOString(),
  };

  const all = readJson<Record<string, ScatterProject>>(PROJECTS_KEY, {});
  all[updated.id] = updated;
  writeJson(PROJECTS_KEY, all);

  const recent = readJson<RecentProjectEntry[]>(RECENT_KEY, []);
  const filtered = recent.filter((entry) => entry.id !== updated.id);
  writeJson(RECENT_KEY, [
    { id: updated.id, name: updated.name, savedAt: updated.savedAt },
    ...filtered,
  ].slice(0, MAX_RECENT));

  return updated;
}

export function loadProject(id: string): ScatterProject | null {
  const all = readJson<Record<string, ScatterProject>>(PROJECTS_KEY, {});
  const project = all[id];
  return project ? migrateProject(project) : null;
}

export function listRecentProjects(): RecentProjectEntry[] {
  return readJson<RecentProjectEntry[]>(RECENT_KEY, []);
}

export function listSavedProjects(): ScatterProject[] {
  const all = readJson<Record<string, ScatterProject>>(PROJECTS_KEY, {});
  return Object.values(all).sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
  );
}

export function deleteProject(id: string): void {
  const all = readJson<Record<string, ScatterProject>>(PROJECTS_KEY, {});
  delete all[id];
  writeJson(PROJECTS_KEY, all);

  const recent = readJson<RecentProjectEntry[]>(RECENT_KEY, []);
  writeJson(RECENT_KEY, recent.filter((entry) => entry.id !== id));
}

export function downloadProjectJson(project: ScatterProject): void {
  const blob = new Blob([projectToJson(project)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${project.name.replace(/[^a-z0-9-_]+/gi, "-").toLowerCase() || "project"}.scatter.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function snapshotProject(
  projectId: string,
  name: string,
  sequence: ScatterProject["sequence"],
  customBrands: BrandPreset[],
  assets: ScatterProject["assets"],
): ScatterProject {
  return {
    version: 1,
    id: projectId,
    name,
    savedAt: new Date().toISOString(),
    sequence: structuredClone(sequence),
    customBrands: structuredClone(customBrands),
    assets: structuredClone(assets),
  };
}
