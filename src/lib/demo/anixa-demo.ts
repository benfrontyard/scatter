import { createBlockInstance, createTransitionBetween } from "@/lib/sequence-factory";
import { defaultBrandPresetId } from "@/config/brands";
import { defaultFormatId } from "@/config/formats";
import { getAudioDuration } from "@/lib/audio";
import { publicAssetUrl } from "@/lib/public-asset-url";
import type { MotionSequence, ProjectAsset, ScatterProject } from "@/types";

export const ANIXA_SCRIPT = `The immune system can fight cancer, but tumors have learned to hide.

We're training the body's own cells to find and destroy ovarian and breast cancers using breakthrough immunotherapies developed with Moffitt Cancer Center and Cleveland Clinic.

Our ovarian cancer trial shows patients living far beyond expectations, with one now at twenty-eight months and dose escalation approved.

Invest in cancer defeated by your own immune system. Anixa Biosciences, ANIX on NASDAQ.`;

export const ANIXA_VO_URL = publicAssetUrl("/audio/test/voiceover.mp3");
export const ANIXA_MUSIC_URL = publicAssetUrl("/audio/test/music.mp3");

async function fetchAsDataUrl(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}`);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error(`Failed to read ${url}`));
    reader.readAsDataURL(blob);
  });
}

export function buildAnixaSequence(): MotionSequence {
  const logoReveal = createBlockInstance("logo-reveal", {
    content: {
      logoText: "ANIXA",
      tagline: "The immune system can fight cancer, but tumors have learned to hide.",
    },
  });

  const feature = createBlockInstance("feature-announcement", {
    content: {
      headline: "Training the body to fight back",
      subhead:
        "We're training the body's own cells to find and destroy ovarian and breast cancers using breakthrough immunotherapies developed with Moffitt Cancer Center and Cleveland Clinic.",
      logoText: "ANIXA",
      backgroundColor: "",
      accentColor: "",
    },
  });

  const statCard = createBlockInstance("stat-card", {
    content: {
      value: "28 mo",
      label: "Patient survival",
      supportingText:
        "Our ovarian cancer trial shows patients living far beyond expectations, with one now at twenty-eight months and dose escalation approved.",
    },
  });

  const cta = createBlockInstance("cta-lockup", {
    content: {
      message: "Invest in cancer defeated by your own immune system.",
      cta: "ANIX on NASDAQ",
      url: "anixa.com",
      logoText: "ANIXA",
    },
  });

  return {
    id: "anixa-demo",
    name: "Anixa Biosciences — Magic Edit Demo",
    format: defaultFormatId,
    brandPresetId: defaultBrandPresetId,
    blocks: [logoReveal, feature, statCard, cta],
    transitions: [
      createTransitionBetween(logoReveal, feature, "crossfade"),
      createTransitionBetween(feature, statCard, "push"),
      createTransitionBetween(statCard, cta, "crossfade"),
    ],
  };
}

export type AnixaDemoAssets = {
  voAsset: ProjectAsset;
  musicAsset: ProjectAsset;
  sequence: MotionSequence;
};

export async function loadAnixaDemoAssets(): Promise<AnixaDemoAssets> {
  const [voDataUrl, musicDataUrl] = await Promise.all([
    fetchAsDataUrl(ANIXA_VO_URL),
    fetchAsDataUrl(ANIXA_MUSIC_URL),
  ]);

  const [voDuration, musicDuration] = await Promise.all([
    getAudioDuration(voDataUrl),
    getAudioDuration(musicDataUrl),
  ]);

  const voAsset: ProjectAsset = {
    id: "audio-anixa-vo",
    name: "Anixa voiceover (ElevenLabs)",
    type: "audio",
    dataUrl: voDataUrl,
    duration: voDuration,
    mimeType: "audio/mpeg",
  };

  const musicAsset: ProjectAsset = {
    id: "audio-anixa-music",
    name: "Corporate instrumental",
    type: "audio",
    dataUrl: musicDataUrl,
    duration: musicDuration,
    mimeType: "audio/mpeg",
  };

  const sequence = buildAnixaSequence();

  return { voAsset, musicAsset, sequence };
}

export function attachAudioToSequence(
  sequence: MotionSequence,
  voAsset: ProjectAsset,
  musicAsset: ProjectAsset,
): MotionSequence {
  return {
    ...sequence,
    audio: {
      mix: {
        voiceoverVolume: 1,
        musicVolume: 0.35,
        musicVolumeUnderVo: 0.12,
        duckingEnabled: true,
        musicFadeInMs: 500,
        musicFadeOutMs: 1200,
        voiceoverFadeInMs: 0,
        voiceoverFadeOutMs: 300,
      },
      markers: [],
      voiceover: {
        assetId: voAsset.id,
        provider: "elevenlabs",
        transcript: ANIXA_SCRIPT,
      },
      music: {
        assetId: musicAsset.id,
        fitMode: "trim",
      },
    },
  };
}

export async function buildAnixaDemoProject(): Promise<ScatterProject> {
  const { voAsset, musicAsset, sequence } = await loadAnixaDemoAssets();
  return {
    version: 1,
    id: crypto.randomUUID(),
    name: "Anixa Biosciences — Magic Edit Demo",
    savedAt: new Date().toISOString(),
    sequence: attachAudioToSequence(sequence, voAsset, musicAsset),
    customBrands: [],
    assets: [voAsset, musicAsset],
  };
}
