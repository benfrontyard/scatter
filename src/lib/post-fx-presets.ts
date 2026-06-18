import type { PostFXPreset, PostFXSettings } from "@/types/post-fx";

const USER_PRESETS_KEY = "scatter:postfx-user-presets";

export function loadUserPostFXPresets(): PostFXPreset[] {
  try {
    const raw = localStorage.getItem(USER_PRESETS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PostFXPreset[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveUserPostFXPreset(name: string, settings: PostFXSettings): PostFXPreset {
  const preset: PostFXPreset = {
    id: `user-${crypto.randomUUID().slice(0, 8)}`,
    name,
    description: "Custom saved preset",
    settings: structuredClone(settings),
  };

  const existing = loadUserPostFXPresets();
  localStorage.setItem(USER_PRESETS_KEY, JSON.stringify([preset, ...existing].slice(0, 12)));
  return preset;
}
