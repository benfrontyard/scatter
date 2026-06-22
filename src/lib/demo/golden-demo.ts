import {
  createBlockInstance,
  createTransitionBetween,
} from "@/lib/sequence-factory";
import { transitionDefinitionMap } from "@/config/transitions";
import { defaultBrandPresetId } from "@/config/brands";
import { defaultFormatId } from "@/config/formats";
import { legacyEasingToId } from "@/lib/easing";
import { resolveBrandTransitionPreset, type TransitionPresetId } from "@/lib/transitions/presets";
import type { MotionSequence, ScatterProject } from "@/types";
import { DEFAULT_AUDIO_MIX } from "@/types/audio";
import { publicAssetUrl } from "@/lib/public-asset-url";

export const GOLDEN_DEMO_TITLE = "Launch a branded video in minutes";

/** Script option A — clean product voice (~25–30s at calm pace). */
export const GOLDEN_DEMO_VO_SCRIPT = `Scatter turns your brand kit into a motion system. Add your colors, type, logos, and motion rules. Choose from adaptive blocks that resize across every format. Then sync voice, music, and timing into one polished video. From first idea to final export, your brand stays consistent — and every video still feels custom.`;

export const GOLDEN_DEMO_VO_SCRIPT_B = `Your brand kit, already in motion. Scatter turns colors, type, logos, and motion rules into adaptive video blocks. Build once, resize for every channel, then sync voice, music, and timing. Polished branded video, ready to export.`;

export const GOLDEN_DEMO_VO_SCRIPT_C = `Start with a brand kit. Scatter turns it into a motion system — colors, type, logos, timing, transitions, and sound. Pick adaptive blocks, test every format, sync the beat, and export a polished video in minutes.`;

/** Placeholder paths — safe when missing until assets are dropped in. */
export const GOLDEN_DEMO_MUSIC_URL = publicAssetUrl("/audio/demo/placeholder-music.mp3");
export const GOLDEN_DEMO_VO_URL = publicAssetUrl("/audio/demo/placeholder-vo.mp3");

/** Manually defined beat grid for demo rhythm (frames @ 30fps, ~120 BPM). */
export const GOLDEN_DEMO_BEAT_MARKERS = [
  0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285,
  300, 315, 330, 345, 360, 375, 390, 405, 420, 435, 450, 465, 480, 495, 510, 525, 540, 555, 570,
  585, 600, 615, 630, 645, 660, 675, 690, 705, 720, 735, 750, 765, 780, 795, 810, 825, 840,
];

/** Demo audio config shape (maps to SequenceAudio when assets are attached). */
export type DemoAudioConfig = {
  voiceover: {
    enabled: boolean;
    script: string;
    audioUrl?: string;
    volume: number;
  };
  music: {
    enabled: boolean;
    trackUrl?: string;
    volume: number;
    fadeInFrames: number;
    fadeOutFrames: number;
    beatMarkers?: number[];
  };
};

export const GOLDEN_DEMO_AUDIO_CONFIG: DemoAudioConfig = {
  voiceover: {
    enabled: true,
    script: GOLDEN_DEMO_VO_SCRIPT,
    audioUrl: GOLDEN_DEMO_VO_URL,
    volume: 1,
  },
  music: {
    enabled: true,
    trackUrl: GOLDEN_DEMO_MUSIC_URL,
    volume: 0.32,
    fadeInFrames: 15,
    fadeOutFrames: 45,
    beatMarkers: GOLDEN_DEMO_BEAT_MARKERS,
  },
};

function createDemoTransition(
  from: ReturnType<typeof createBlockInstance>,
  to: ReturnType<typeof createBlockInstance>,
  presetId: TransitionPresetId,
) {
  const preset = transitionDefinitionMap[presetId];
  return createTransitionBetween(from, to, presetId, {
    type: preset?.type ?? "crossfade",
    duration: preset?.defaultDuration ?? 18,
    direction: preset?.defaultDirection ?? "up",
    overlap: preset?.defaultOverlap ?? 0.55,
    easingId:
      preset?.defaultEasingId ?? legacyEasingToId("ease-out"),
  });
}

/** Golden demo — 6 scenes, ~28s @ 30fps. */
export function buildGoldenDemoSequence(): MotionSequence {
  const hook = createBlockInstance("editorial-statement", {
    content: {
      headline: "Your brand kit, already in motion.",
      subhead: "",
      accentWord: "motion",
    },
    duration: 105,
  });

  const brandKit = createBlockInstance("hero-split-text-media", {
    content: {
      headline: "Add colors, type, logos, and motion rules.",
      subhead: "One identity system for every video.",
      body: "",
      media: "",
      cta: "",
    },
    duration: 120,
  });

  const motionBlocks = createBlockInstance("template-carousel", {
    content: {
      categoryLabel: "Adaptive formats",
      "item-1-title": "16:9 Landscape",
      "item-1-meta": "YouTube",
      "item-2-title": "9:16 Vertical",
      "item-2-meta": "Reels",
      "item-3-title": "1:1 Square",
      "item-3-meta": "Feed",
      activeIndex: "1",
    },
    duration: 120,
  });

  const audioScene = createBlockInstance("big-stat-proof", {
    content: {
      statValue: "100%",
      statWrapper: "Sync voice, music, and timing",
      stepLabel: "Audio timeline",
      showStepRail: "true",
    },
    duration: 105,
  });

  const exportScene = createBlockInstance("centered-ui-feature", {
    content: {
      headline: "Export polished videos for every channel.",
      body: "Format cards, quality presets, and one-click delivery.",
      inputText: "Ready to export",
      cta: "Export",
      showStepRail: "false",
    },
    duration: 105,
  });

  const endCard = createBlockInstance("brand-payoff", {
    content: {
      logoText: "Scatter",
      cta: "Brand motion at scale.",
      url: "scatter.dev",
      showUrl: "true",
    },
    duration: 90,
  });

  const blocks = [hook, brandKit, motionBlocks, audioScene, exportScene, endCard];

  const transitions = [
    createDemoTransition(hook, brandKit, "scale-handoff"),
    createDemoTransition(brandKit, motionBlocks, "match-cut"),
    createDemoTransition(motionBlocks, audioScene, "match-cut"),
    createDemoTransition(audioScene, exportScene, "match-cut"),
    createDemoTransition(exportScene, endCard, "hold-cut"),
  ];

  return {
    id: "golden-demo",
    name: GOLDEN_DEMO_TITLE,
    format: defaultFormatId,
    brandPresetId: defaultBrandPresetId,
    blocks,
    transitions,
    audio: {
      mix: {
        ...DEFAULT_AUDIO_MIX,
        voiceoverVolume: GOLDEN_DEMO_AUDIO_CONFIG.voiceover.volume,
        musicVolume: GOLDEN_DEMO_AUDIO_CONFIG.music.volume,
        musicVolumeUnderVo: 0.1,
        duckingEnabled: true,
        musicFadeInMs: Math.round(
          (GOLDEN_DEMO_AUDIO_CONFIG.music.fadeInFrames / 30) * 1000,
        ),
        musicFadeOutMs: Math.round(
          (GOLDEN_DEMO_AUDIO_CONFIG.music.fadeOutFrames / 30) * 1000,
        ),
        voiceoverFadeInMs: 0,
        voiceoverFadeOutMs: 400,
      },
      markers: (GOLDEN_DEMO_AUDIO_CONFIG.music.beatMarkers ?? []).map((frame, i) => ({
        id: `beat-${i}`,
        type: "beat" as const,
        time: frame / 30,
        source: "manual" as const,
      })),
      voiceover: GOLDEN_DEMO_AUDIO_CONFIG.voiceover.enabled
        ? {
            assetId: "golden-demo-vo",
            provider: "custom",
            transcript: GOLDEN_DEMO_AUDIO_CONFIG.voiceover.script,
          }
        : undefined,
      music: GOLDEN_DEMO_AUDIO_CONFIG.music.enabled
        ? {
            assetId: "golden-demo-music",
            fitMode: "loop",
          }
        : undefined,
    },
  };
}

export function createGoldenDemoProject(): ScatterProject {
  return {
    version: 1,
    id: crypto.randomUUID(),
    name: GOLDEN_DEMO_TITLE,
    savedAt: new Date().toISOString(),
    sequence: buildGoldenDemoSequence(),
    customBrands: [],
    assets: [],
  };
}

/** Resolve transition preset from a demo brand kit's motion DNA. */
export function getDemoKitTransitionPreset(kitTransitionPrimary: string): string {
  return resolveBrandTransitionPreset(kitTransitionPrimary);
}
