/**
 * Demo Brand Motion Kit schema for fake brand testing data.
 * Kept separate from `BrandPreset` in `@/types/brand` — these kits are richer
 * onboarding/demo payloads; map to BrandPreset when wiring editor integration.
 */
export type HexColor = `#${string}`;

export interface BrandMotionKit {
  name: string;
  category: string;
  description: string;
  audience: string;
  positioning: string;
  personality: string[];
  voiceTone: {
    principles: string[];
    sample: string[];
  };
  identity: {
    logoConcept: string;
    logoVariants: string[];
    logoUsageRules: string[];
    colors: Record<string, {
      name: string;
      hex: HexColor;
      role: string;
    }>;
    typography: {
      display: FontChoice;
      heading: FontChoice;
      body: FontChoice;
      mono: FontChoice;
      scale: Record<string, TypeScaleToken>;
    };
    iconStyle: {
      style: string;
      strokeWidth: number;
      cornerRadius: string;
      rules: string[];
    };
    layoutGrid: {
      system: string;
      rules: string[];
    };
    imageryStyle: string;
    uiStyle: string;
    doDontRules: {
      do: string[];
      dont: string[];
    };
  };
  motionKit: {
    motionPersonality: string;
    easing: {
      default: string;
      exit: string;
      emphasis: string;
      notes: string;
    };
    timingScale: {
      micro: number;
      standard: number;
      emphasis: number;
      hero: number;
    };
    textReveal: {
      default: string;
      secondary: string[];
      rules: string[];
    };
    transitions: {
      primary: string;
      secondary: string[];
      rules: string[];
    };
    camera: {
      style: string;
      zoomAmount: number;
      perspective: number;
      parallaxDepth: number;
      rotation: number;
      focusBlur: number;
    };
    effects: Record<string, {
      enabled: boolean;
      intensity: number;
    }>;
    logoAnimation: string;
    blockDefaults: Record<string, string>;
    exportDefaults: {
      aspectRatios: string[];
      defaultDurationSeconds: number;
      previewQuality: 'low' | 'medium' | 'high';
      exportQuality: 'low' | 'medium' | 'high';
    };
  };
  templates: TemplatePreset[];
}

export interface FontChoice {
  family: string;
  fallback: string;
  weight: number;
}

export interface TypeScaleToken {
  size: number;
  lineHeight: number;
  tracking: number;
}

export interface TemplatePreset {
  id: string;
  name: string;
  category: string;
  previewAnimation: string;
  aspectRatios: string[];
  inherits: string[];
  settings: {
    brandDefault: boolean;
  };
}

export type FakeBrandId = 'nimbo' | 'ledgerly' | 'draftly';

export type AssetType =
  | 'icon'
  | 'font'
  | 'photo'
  | 'video'
  | 'texture'
  | 'audio'
  | 'sfx'
  | 'mockup';

/** Provenance metadata for every imported or placeholder asset. */
export interface AssetSource {
  id: string;
  brandId: FakeBrandId;
  assetType: AssetType;
  sourceName: string;
  sourceUrl: string;
  licenseName: string;
  licenseUrl: string;
  authorName?: string;
  authorUrl?: string;
  searchQuery?: string;
  tags: string[];
  localPath?: string;
  usageNotes?: string;
  restrictedUses: string[];
}
