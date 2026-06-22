import { DEFAULT_BRAND_COMPOSITION } from "@/config/composition/defaults";
import { DEFAULT_BRAND_LOGO_SYSTEM } from "@/config/logo/defaults";
import { defaultBrandEffects } from "@/config/effects/defaults";
import { defaultBrandTypography } from "@/config/typography/defaults";
import {
  DEFAULT_EASING_ID,
  DEFAULT_TRANSITION_EASING_ID,
} from "@/config/easing-presets";
import {
  BRAND_KIT_TRANSITION_DEFAULTS,
  resolveBrandTransitionPreset,
} from "@/lib/transitions/presets";
import type { BrandMotionKit } from "@/data/fakeBrands/types";
import { fakeBrandKits } from "@/data/fakeBrands";
import type { BrandPreset } from "@/types";

function parseCubicBezier(easing: string): string {
  if (easing.startsWith("cubic-bezier")) return easing;
  return DEFAULT_EASING_ID;
}

/** Map a demo BrandMotionKit to the lighter BrandPreset used by block preview. */
export function brandMotionKitToBrandPreset(kit: BrandMotionKit): BrandPreset {
  const { identity, motionKit } = kit;
  const colors = identity.colors;

  const kitKey = kit.name.toLowerCase();
  const transitionDefaults = BRAND_KIT_TRANSITION_DEFAULTS[kitKey];
  const transitionPreset = resolveBrandTransitionPreset(
    motionKit.transitions.primary,
    transitionDefaults?.preset,
  );

  return {
    id: kitKey,
    name: kit.name,
    personality:
      kit.name === "Nimbo"
        ? "precise"
        : kit.name === "Draftly"
          ? "playful"
          : kit.name === "Ledgerly"
            ? "editorial"
            : "calm",
    colors: {
      background: colors.background?.hex ?? "#ffffff",
      foreground: colors.primary?.hex ?? "#111111",
      accent: colors.accent?.hex ?? "#3b82f6",
      muted: colors.muted?.hex ?? "#6b7280",
      surface: colors.surface?.hex ?? colors.secondary?.hex ?? "#f3f4f6",
      border: colors.secondary?.hex,
    },
    typography: {
      ...defaultBrandTypography,
      fontFamilies: {
        heading: identity.typography.heading.family,
        body: identity.typography.body.family,
        accent: identity.typography.display.family,
      },
      density: kit.name === "Nimbo" ? "balanced" : kit.name === "Draftly" ? "spacious" : "compact",
    },
    composition: {
      ...DEFAULT_BRAND_COMPOSITION,
      style: kit.name === "Ledgerly" ? "swiss" : kit.name === "Draftly" ? "expressive" : "product",
    },
    logos: {
      ...DEFAULT_BRAND_LOGO_SYSTEM,
      primaryType: "wordmark",
      textFallback: kit.name,
    },
    effects: defaultBrandEffects,
    motion: {
      defaultEasingId: parseCubicBezier(motionKit.easing.default),
      entranceEasingId: parseCubicBezier(motionKit.easing.default),
      exitEasingId: parseCubicBezier(motionKit.easing.exit),
      transitionEasingId: transitionDefaults?.easingId ?? DEFAULT_TRANSITION_EASING_ID,
      speed: motionKit.timingScale.standard / 300,
      intensity:
        transitionDefaults?.intensity === "high"
          ? 1.2
          : transitionDefaults?.intensity === "soft"
            ? 0.85
            : motionKit.camera.zoomAmount > 1.05
              ? 1.1
              : 1,
      stagger: Math.round(motionKit.timingScale.micro / 4),
      directionBias:
        transitionPreset === "push-left"
          ? "left"
          : transitionPreset === "wipe"
            ? "right"
            : "up",
    },
  };
}

/** Demo brand kits (Nimbo, Ledgerly, Draftly) as BrandPresets for block testing. */
export const studioBrandPresets: BrandPreset[] = fakeBrandKits.map(brandMotionKitToBrandPreset);

export const studioBrandPresetMap = Object.fromEntries(
  studioBrandPresets.map((b) => [b.id, b]),
) as Record<string, BrandPreset>;
