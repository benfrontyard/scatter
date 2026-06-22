import type { AssetSource, AssetType, FakeBrandId } from './types';

export type IconLibraryRecommendation = {
  brandId: FakeBrandId;
  primary: {
    name: string;
    url: string;
    licenseName: string;
    licenseUrl: string;
    notes?: string;
  };
  fallback?: {
    name: string;
    url: string;
    licenseName: string;
    licenseUrl: string;
  };
};

export type FontStackRole = {
  role: string;
  family: string;
  alternatives?: string[];
  sourceName: string;
  sourceUrl: string;
  licenseName: string;
  licenseUrl: string;
};

export type FontLibraryRecommendation = {
  brandId: FakeBrandId;
  stack: FontStackRole[];
};

export type StockLibraryRecommendation = {
  name: string;
  url: string;
  licenseName: string;
  licenseUrl: string;
  assetTypes: AssetType[];
  notes?: string;
};

export type FakeBrandAssetRules = {
  global: string[];
  restrictedUses: string[];
  preferredImagery: string[];
  peopleImagery: string[];
};

export const recommendedIconLibraries: IconLibraryRecommendation[] = [
  {
    brandId: 'nimbo',
    primary: {
      name: 'Lucide',
      url: 'https://lucide.dev',
      licenseName: 'ISC License',
      licenseUrl: 'https://lucide.dev/license',
      notes: 'Thin-line geometric icons; match 1.75px stroke and soft corners.',
    },
    fallback: {
      name: 'Heroicons',
      url: 'https://heroicons.com',
      licenseName: 'MIT License',
      licenseUrl: 'https://github.com/tailwindlabs/heroicons/blob/master/LICENSE',
    },
  },
  {
    brandId: 'ledgerly',
    primary: {
      name: 'Tabler Icons',
      url: 'https://tabler.io/icons',
      licenseName: 'MIT License',
      licenseUrl: 'https://github.com/tabler/tabler-icons/blob/master/LICENSE',
      notes: 'Structured line icons with selective filled details; 2px stroke.',
    },
    fallback: {
      name: 'Google Material Symbols Sharp',
      url: 'https://fonts.google.com/icons',
      licenseName: 'Apache License 2.0',
      licenseUrl: 'https://www.apache.org/licenses/LICENSE-2.0',
    },
  },
  {
    brandId: 'draftly',
    primary: {
      name: 'Phosphor Icons',
      url: 'https://phosphoricons.com',
      licenseName: 'MIT License',
      licenseUrl: 'https://github.com/phosphor-icons/core/blob/main/LICENSE',
      notes: 'Rounded expressive icons with simple filled accents.',
    },
    fallback: {
      name: 'Heroicons',
      url: 'https://heroicons.com',
      licenseName: 'MIT License',
      licenseUrl: 'https://github.com/tailwindlabs/heroicons/blob/master/LICENSE',
    },
  },
];

export const recommendedFontLibraries: FontLibraryRecommendation[] = [
  {
    brandId: 'nimbo',
    stack: [
      {
        role: 'Display',
        family: 'Geist',
        alternatives: ['Inter Tight'],
        sourceName: 'Google Fonts / Vercel',
        sourceUrl: 'https://fonts.google.com/specimen/Inter+Tight',
        licenseName: 'SIL Open Font License 1.1',
        licenseUrl: 'https://openfontlicense.org',
      },
      {
        role: 'Heading',
        family: 'Inter',
        sourceName: 'Google Fonts',
        sourceUrl: 'https://fonts.google.com/specimen/Inter',
        licenseName: 'SIL Open Font License 1.1',
        licenseUrl: 'https://openfontlicense.org',
      },
      {
        role: 'Body',
        family: 'Inter',
        sourceName: 'Google Fonts',
        sourceUrl: 'https://fonts.google.com/specimen/Inter',
        licenseName: 'SIL Open Font License 1.1',
        licenseUrl: 'https://openfontlicense.org',
      },
      {
        role: 'Mono',
        family: 'IBM Plex Mono',
        sourceName: 'Google Fonts',
        sourceUrl: 'https://fonts.google.com/specimen/IBM+Plex+Mono',
        licenseName: 'SIL Open Font License 1.1',
        licenseUrl: 'https://openfontlicense.org',
      },
    ],
  },
  {
    brandId: 'ledgerly',
    stack: [
      {
        role: 'Display',
        family: 'Manrope',
        sourceName: 'Google Fonts',
        sourceUrl: 'https://fonts.google.com/specimen/Manrope',
        licenseName: 'SIL Open Font License 1.1',
        licenseUrl: 'https://openfontlicense.org',
      },
      {
        role: 'Heading',
        family: 'Inter',
        sourceName: 'Google Fonts',
        sourceUrl: 'https://fonts.google.com/specimen/Inter',
        licenseName: 'SIL Open Font License 1.1',
        licenseUrl: 'https://openfontlicense.org',
      },
      {
        role: 'Body',
        family: 'Inter',
        sourceName: 'Google Fonts',
        sourceUrl: 'https://fonts.google.com/specimen/Inter',
        licenseName: 'SIL Open Font License 1.1',
        licenseUrl: 'https://openfontlicense.org',
      },
      {
        role: 'Mono / Data',
        family: 'IBM Plex Mono',
        alternatives: ['Roboto Mono'],
        sourceName: 'Google Fonts',
        sourceUrl: 'https://fonts.google.com/specimen/IBM+Plex+Mono',
        licenseName: 'SIL Open Font License 1.1',
        licenseUrl: 'https://openfontlicense.org',
      },
    ],
  },
  {
    brandId: 'draftly',
    stack: [
      {
        role: 'Display',
        family: 'Archivo',
        sourceName: 'Google Fonts',
        sourceUrl: 'https://fonts.google.com/specimen/Archivo',
        licenseName: 'SIL Open Font License 1.1',
        licenseUrl: 'https://openfontlicense.org',
      },
      {
        role: 'Heading',
        family: 'Archivo',
        sourceName: 'Google Fonts',
        sourceUrl: 'https://fonts.google.com/specimen/Archivo',
        licenseName: 'SIL Open Font License 1.1',
        licenseUrl: 'https://openfontlicense.org',
      },
      {
        role: 'Body',
        family: 'Inter',
        sourceName: 'Google Fonts',
        sourceUrl: 'https://fonts.google.com/specimen/Inter',
        licenseName: 'SIL Open Font License 1.1',
        licenseUrl: 'https://openfontlicense.org',
      },
      {
        role: 'Accent',
        family: 'Fraunces',
        alternatives: ['Instrument Serif'],
        sourceName: 'Google Fonts',
        sourceUrl: 'https://fonts.google.com/specimen/Fraunces',
        licenseName: 'SIL Open Font License 1.1',
        licenseUrl: 'https://openfontlicense.org',
      },
    ],
  },
];

export const recommendedStockLibraries: StockLibraryRecommendation[] = [
  {
    name: 'Pexels',
    url: 'https://www.pexels.com',
    licenseName: 'Pexels License',
    licenseUrl: 'https://www.pexels.com/license/',
    assetTypes: ['photo', 'video'],
    notes: 'Free for commercial use; attribution appreciated but not required.',
  },
  {
    name: 'Unsplash',
    url: 'https://unsplash.com',
    licenseName: 'Unsplash License',
    licenseUrl: 'https://unsplash.com/license',
    assetTypes: ['photo'],
    notes: 'Free for commercial and non-commercial use; no endorsement implied.',
  },
  {
    name: 'Pixabay',
    url: 'https://pixabay.com',
    licenseName: 'Pixabay Content License',
    licenseUrl: 'https://pixabay.com/service/license/',
    assetTypes: ['photo', 'video', 'audio', 'sfx'],
    notes: 'Royalty-free content; verify asset-specific terms before use.',
  },
  {
    name: 'Mixkit',
    url: 'https://mixkit.co',
    licenseName: 'Mixkit License',
    licenseUrl: 'https://mixkit.co/license/',
    assetTypes: ['video', 'audio', 'sfx'],
    notes: 'Free stock video and audio for commercial projects.',
  },
];

export const fakeBrandAssetQueries: Record<FakeBrandId, string[]> = {
  nimbo: [
    'clean saas dashboard',
    'productivity app interface',
    'software team workspace',
    'minimal office desk',
    'abstract blue gradient',
    'dark mode dashboard',
    'project management UI',
    'team planning board',
  ],
  ledgerly: [
    'finance dashboard',
    'analytics chart',
    'cashflow report',
    'premium office interior',
    'agency business meeting',
    'invoice document close up',
    'financial planning',
    'dark dashboard UI',
    'gold abstract gradient',
  ],
  draftly: [
    'content calendar',
    'creator workspace',
    'social media planning',
    'colorful sticky notes',
    'phone content creation',
    'notebook planning',
    'collaborative workspace',
    'marketing calendar',
    'paper texture',
  ],
};

export const fakeBrandAssetRules: FakeBrandAssetRules = {
  global: [
    'Store asset source, license URL, author name (if available), and download/source URL in metadata for every import.',
    'Use Google Fonts and open-source fonts only for typography.',
    'All imported assets are replaceable placeholders — not permanent brand identity assets.',
    'Do not download assets automatically without a dedicated import script that writes metadata.',
  ],
  restrictedUses: [
    'Do not use recognizable real brand logos, trademarked UI, celebrity images, or branded products.',
    'Do not use assets that imply endorsement by real people or companies.',
    'Do not use stock images as logos, trademarks, or core brand marks.',
    'Do not treat placeholder assets as final brand identity without legal review.',
  ],
  preferredImagery: [
    'Prefer abstract visuals, cropped details, hands, devices without visible logos, UI placeholders, textures, and gradients.',
    'Use original generated mock UI over screenshots of real products.',
    'Favor workspace details, silhouettes, and environmental context over hero portraits.',
  ],
  peopleImagery: [
    'Avoid identifiable faces in fake endorsements or testimonial contexts.',
    'Prefer cropped hands, over-the-shoulder shots, silhouettes, or workspace details.',
    'When people appear, keep usage editorial and non-promotional.',
  ],
};

/** Curated placeholder entries — metadata only until an import script fills localPath. */
export const placeholderAssetSources: AssetSource[] = [
  {
    id: 'nimbo-photo-dashboard',
    brandId: 'nimbo',
    assetType: 'photo',
    sourceName: 'Pexels',
    sourceUrl: 'https://www.pexels.com/search/clean%20saas%20dashboard/',
    licenseName: 'Pexels License',
    licenseUrl: 'https://www.pexels.com/license/',
    searchQuery: 'clean saas dashboard',
    tags: ['dashboard', 'saas', 'ui', 'placeholder'],
    usageNotes: 'Hero or product UI reveal background; crop to hide any third-party branding.',
    restrictedUses: ['logo', 'trademark', 'endorsement'],
  },
  {
    id: 'nimbo-video-team-workspace',
    brandId: 'nimbo',
    assetType: 'video',
    sourceName: 'Mixkit',
    sourceUrl: 'https://mixkit.co/free-stock-video/software/',
    licenseName: 'Mixkit License',
    licenseUrl: 'https://mixkit.co/license/',
    searchQuery: 'software team workspace',
    tags: ['workspace', 'team', 'b-roll', 'placeholder'],
    usageNotes: 'Short loop for motion blocks; prefer over-shoulder or screen-only shots.',
    restrictedUses: ['logo', 'endorsement', 'identifiable-face-testimonial'],
  },
  {
    id: 'nimbo-texture-gradient',
    brandId: 'nimbo',
    assetType: 'texture',
    sourceName: 'Unsplash',
    sourceUrl: 'https://unsplash.com/s/photos/abstract-blue-gradient',
    licenseName: 'Unsplash License',
    licenseUrl: 'https://unsplash.com/license',
    searchQuery: 'abstract blue gradient',
    tags: ['gradient', 'abstract', 'background'],
    usageNotes: 'Background layer behind mock UI; keep Nimbo Signal Blue in overlay.',
    restrictedUses: ['logo', 'trademark'],
  },
  {
    id: 'nimbo-mockup-ui',
    brandId: 'nimbo',
    assetType: 'mockup',
    sourceName: 'Generated placeholder',
    sourceUrl: 'internal://fake-brands/nimbo/mock-ui',
    licenseName: 'Original work',
    licenseUrl: 'internal://fake-brands/license',
    tags: ['mockup', 'ui', 'generated'],
    usageNotes: 'Build in Figma or code — generic project board, no real product logos.',
    restrictedUses: ['real-brand-ui', 'trademark'],
  },
  {
    id: 'ledgerly-photo-finance',
    brandId: 'ledgerly',
    assetType: 'photo',
    sourceName: 'Unsplash',
    sourceUrl: 'https://unsplash.com/s/photos/finance-dashboard',
    licenseName: 'Unsplash License',
    licenseUrl: 'https://unsplash.com/license',
    searchQuery: 'finance dashboard',
    tags: ['finance', 'dashboard', 'dark', 'placeholder'],
    usageNotes: 'Stat card or hero backdrop; prefer dark UI with gold accent compatibility.',
    restrictedUses: ['logo', 'trademark', 'endorsement'],
  },
  {
    id: 'ledgerly-photo-invoice',
    brandId: 'ledgerly',
    assetType: 'photo',
    sourceName: 'Pexels',
    sourceUrl: 'https://www.pexels.com/search/invoice%20document/',
    licenseName: 'Pexels License',
    licenseUrl: 'https://www.pexels.com/license/',
    searchQuery: 'invoice document close up',
    tags: ['document', 'invoice', 'detail', 'placeholder'],
    usageNotes: 'Cropped document detail; blur or replace any legible real company names.',
    restrictedUses: ['logo', 'trademark', 'real-company-name'],
  },
  {
    id: 'ledgerly-texture-gold',
    brandId: 'ledgerly',
    assetType: 'texture',
    sourceName: 'Pixabay',
    sourceUrl: 'https://pixabay.com/images/search/gold%20abstract%20gradient/',
    licenseName: 'Pixabay Content License',
    licenseUrl: 'https://pixabay.com/service/license/',
    searchQuery: 'gold abstract gradient',
    tags: ['gold', 'gradient', 'premium', 'texture'],
    usageNotes: 'Subtle premium accent layer; keep below 20% opacity on dark surfaces.',
    restrictedUses: ['logo', 'trademark'],
  },
  {
    id: 'ledgerly-mockup-analytics',
    brandId: 'ledgerly',
    assetType: 'mockup',
    sourceName: 'Generated placeholder',
    sourceUrl: 'internal://fake-brands/ledgerly/mock-analytics',
    licenseName: 'Original work',
    licenseUrl: 'internal://fake-brands/license',
    tags: ['mockup', 'analytics', 'chart', 'generated'],
    usageNotes: 'Original chart UI with fake data; no real financial institution branding.',
    restrictedUses: ['real-brand-ui', 'trademark', 'endorsement'],
  },
  {
    id: 'draftly-photo-calendar',
    brandId: 'draftly',
    assetType: 'photo',
    sourceName: 'Unsplash',
    sourceUrl: 'https://unsplash.com/s/photos/content-calendar',
    licenseName: 'Unsplash License',
    licenseUrl: 'https://unsplash.com/license',
    searchQuery: 'content calendar',
    tags: ['calendar', 'planning', 'creator', 'placeholder'],
    usageNotes: 'Social ad or feature callout background; colorful but not cluttered.',
    restrictedUses: ['logo', 'trademark', 'endorsement'],
  },
  {
    id: 'draftly-photo-sticky-notes',
    brandId: 'draftly',
    assetType: 'photo',
    sourceName: 'Pexels',
    sourceUrl: 'https://www.pexels.com/search/colorful%20sticky%20notes/',
    licenseName: 'Pexels License',
    licenseUrl: 'https://www.pexels.com/license/',
    searchQuery: 'colorful sticky notes',
    tags: ['sticky-notes', 'color', 'workspace', 'placeholder'],
    usageNotes: 'Collage or texture layer; avoid readable personal notes in frame.',
    restrictedUses: ['logo', 'identifiable-person', 'endorsement'],
  },
  {
    id: 'draftly-texture-paper',
    brandId: 'draftly',
    assetType: 'texture',
    sourceName: 'Pixabay',
    sourceUrl: 'https://pixabay.com/images/search/paper%20texture/',
    licenseName: 'Pixabay Content License',
    licenseUrl: 'https://pixabay.com/service/license/',
    searchQuery: 'paper texture',
    tags: ['paper', 'texture', 'warm', 'placeholder'],
    usageNotes: 'Subtle paper grain for quote cards or CTA end cards.',
    restrictedUses: ['logo', 'trademark'],
  },
  {
    id: 'draftly-video-creator',
    brandId: 'draftly',
    assetType: 'video',
    sourceName: 'Mixkit',
    sourceUrl: 'https://mixkit.co/free-stock-video/creator/',
    licenseName: 'Mixkit License',
    licenseUrl: 'https://mixkit.co/license/',
    searchQuery: 'phone content creation',
    tags: ['creator', 'phone', 'b-roll', 'placeholder'],
    usageNotes: 'Hands-only or over-shoulder phone usage; no visible app logos on device.',
    restrictedUses: ['logo', 'real-app-ui', 'endorsement', 'identifiable-face-testimonial'],
  },
];

export function brandIdFromName(name: string): FakeBrandId {
  const slug = name.toLowerCase();
  if (slug === 'ledgerly' || slug === 'draftly') return slug;
  return 'nimbo';
}

export function getIconLibraryForBrand(brandId: FakeBrandId): IconLibraryRecommendation {
  return recommendedIconLibraries.find((lib) => lib.brandId === brandId) ?? recommendedIconLibraries[0];
}

export function getFontLibraryForBrand(brandId: FakeBrandId): FontLibraryRecommendation {
  return recommendedFontLibraries.find((lib) => lib.brandId === brandId) ?? recommendedFontLibraries[0];
}

export function getAssetQueriesForBrand(brandId: FakeBrandId): string[] {
  return fakeBrandAssetQueries[brandId];
}

export function getPlaceholderAssetsForBrand(brandId: FakeBrandId): AssetSource[] {
  return placeholderAssetSources.filter((asset) => asset.brandId === brandId);
}
