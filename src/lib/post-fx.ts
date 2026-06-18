import { postFxEffectDefinitionMap } from "@/config/post-fx/definitions";
import { defaultPostFXSettings } from "@/config/post-fx/presets";
import type {
  ExportFXQuality,
  PostFXEffect,
  PostFXEffectType,
  PostFXQuality,
  PostFXRenderMode,
  PostFXSettings,
} from "@/types/post-fx";

export function createPostFXEffect(type: PostFXEffectType): PostFXEffect {
  const definition = postFxEffectDefinitionMap[type];
  return {
    id: `${type}-${crypto.randomUUID().slice(0, 8)}`,
    type,
    enabled: true,
    settings: { ...definition.defaultSettings },
    exportOnly: definition.supportsExportOnly ? false : undefined,
  };
}

export function normalizePostFXSettings(
  postFx: PostFXSettings | undefined,
): PostFXSettings {
  if (!postFx) return structuredClone(defaultPostFXSettings);

  const previewQuality: PostFXQuality = ["off", "low", "medium", "high", "auto"].includes(
    postFx.previewQuality,
  )
    ? postFx.previewQuality
    : "auto";

  const exportQuality: ExportFXQuality = ["standard", "high", "max"].includes(
    postFx.exportQuality,
  )
    ? postFx.exportQuality
    : "high";

  const effects = Array.isArray(postFx.effects)
    ? postFx.effects
        .filter((effect) => postFxEffectDefinitionMap[effect.type as PostFXEffectType])
        .map((effect) => normalizePostFXEffect(effect))
    : [];

  return {
    enabled: Boolean(postFx.enabled),
    previewQuality,
    exportQuality,
    effects,
  };
}

function normalizePostFXEffect(effect: PostFXEffect): PostFXEffect {
  const definition = postFxEffectDefinitionMap[effect.type];
  const settings = { ...definition.defaultSettings };

  for (const [key, value] of Object.entries(effect.settings ?? {})) {
    if (key in settings) {
      settings[key] = value;
    }
  }

  return {
    id: effect.id || `${effect.type}-${crypto.randomUUID().slice(0, 8)}`,
    type: effect.type,
    name: effect.name?.trim() || undefined,
    enabled: effect.enabled !== false,
    solo: effect.solo,
    exportOnly: effect.exportOnly,
    blendMode: effect.blendMode,
    opacity: effect.opacity,
    settings,
  };
}

export function getPostFXEffectDisplayName(effect: PostFXEffect): string {
  if (effect.name?.trim()) return effect.name.trim();
  return postFxEffectDefinitionMap[effect.type].name;
}

export function isPostFXEffectAtDefaults(effect: PostFXEffect): boolean {
  const definition = postFxEffectDefinitionMap[effect.type];

  for (const [key, value] of Object.entries(definition.defaultSettings)) {
    if (effect.settings[key] !== value) return false;
  }

  if (effect.name?.trim()) return false;
  if (effect.exportOnly) return false;
  if (effect.blendMode) return false;
  if (effect.opacity !== undefined) return false;

  return true;
}

export function deletePostFXEffect(
  effects: PostFXEffect[],
  effectId: string,
): PostFXEffect[] {
  return effects.filter((effect) => effect.id !== effectId);
}

export function duplicatePostFXEffect(effect: PostFXEffect): PostFXEffect {
  return {
    ...structuredClone(effect),
    id: `${effect.type}-${crypto.randomUUID().slice(0, 8)}`,
    solo: false,
    name: effect.name?.trim() ? `${effect.name.trim()} copy` : undefined,
  };
}

export function insertPostFXEffectAfter(
  effects: PostFXEffect[],
  afterEffectId: string,
  effect: PostFXEffect,
): PostFXEffect[] {
  const index = effects.findIndex((item) => item.id === afterEffectId);
  if (index < 0) return [...effects, effect];

  const next = [...effects];
  next.splice(index + 1, 0, effect);
  return next;
}

export function movePostFXEffectToIndex(
  effects: PostFXEffect[],
  fromIndex: number,
  toIndex: number,
): PostFXEffect[] {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= effects.length ||
    toIndex >= effects.length
  ) {
    return effects;
  }

  const next = [...effects];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

export function resolveActivePostFXEffects(
  postFx: PostFXSettings,
  renderMode: PostFXRenderMode,
  options?: { isPlaying?: boolean; effectiveQuality?: PostFXQuality },
): PostFXEffect[] {
  if (!postFx.enabled || postFx.effects.length === 0) return [];

  const quality =
    options?.effectiveQuality ??
    (postFx.previewQuality === "auto" ? "medium" : postFx.previewQuality);

  if (renderMode === "preview" && quality === "off") {
    return [];
  }

  const enabled = postFx.effects.filter((effect) => effect.enabled);
  const soloEffect = enabled.find((effect) => effect.solo);

  const stack = soloEffect ? [soloEffect] : enabled;

  const heavyTypes = new Set([
    "blur",
    "glow",
    "bloom",
    "motionBlur",
    "chromaticAberration",
    "grain",
    "noise",
  ]);

  return stack.filter((effect) => {
    if (renderMode === "preview" && effect.exportOnly) return false;
    if (renderMode === "preview" && effect.type === "motionBlur") {
      return Boolean(effect.settings.previewEnabled);
    }
    if (
      renderMode === "preview" &&
      options?.isPlaying &&
      heavyTypes.has(effect.type) &&
      quality !== "high"
    ) {
      return false;
    }
    return true;
  });
}

export function reorderPostFXEffects(
  effects: PostFXEffect[],
  effectId: string,
  direction: "up" | "down",
): PostFXEffect[] {
  const index = effects.findIndex((effect) => effect.id === effectId);
  if (index < 0) return effects;

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= effects.length) return effects;

  const next = [...effects];
  const [item] = next.splice(index, 1);
  next.splice(targetIndex, 0, item);
  return next;
}

export function updatePostFXEffect(
  effects: PostFXEffect[],
  effectId: string,
  updater: (effect: PostFXEffect) => PostFXEffect,
): PostFXEffect[] {
  return effects.map((effect) => (effect.id === effectId ? updater(effect) : effect));
}

export function resetPostFXEffect(effect: PostFXEffect): PostFXEffect {
  const definition = postFxEffectDefinitionMap[effect.type];
  return {
    ...effect,
    name: undefined,
    enabled: true,
    solo: false,
    exportOnly: definition.supportsExportOnly ? false : undefined,
    blendMode: undefined,
    opacity: undefined,
    settings: { ...definition.defaultSettings },
  };
}

export function isPreviewQualityReduced(postFx: PostFXSettings): boolean {
  if (!postFx.enabled) return false;
  if (postFx.previewQuality === "off") return false;
  if (postFx.previewQuality === "high") return false;

  const hasHeavyEffects = postFx.effects.some(
    (effect) =>
      effect.enabled &&
      (effect.exportOnly ||
        ["glow", "bloom", "blur", "motionBlur", "chromaticAberration"].includes(effect.type)),
  );

  return (
    hasHeavyEffects ||
    postFx.previewQuality === "auto" ||
    postFx.previewQuality === "low" ||
    postFx.previewQuality === "medium"
  );
}

export function hasExportOnlyEffects(postFx: PostFXSettings): boolean {
  return postFx.effects.some((effect) => effect.enabled && effect.exportOnly);
}
