import type { PlaygroundTestScenario } from "@/types/motion-block-library";

/** Required playground scenarios per wave-1 library block (from implementation plan). */
export const WAVE1_REQUIRED_SCENARIOS: Record<string, PlaygroundTestScenario[]> = {
  "editorial-statement": ["default", "long-text", "short-text", "low-contrast"],
  "hero-split-text-media": ["default", "long-text", "missing-assets", "bad-crop"],
  "centered-ui-feature": ["default", "long-text", "missing-assets"],
  "hero-prompt-bar": ["default", "long-text", "missing-assets"],
  "brand-payoff": ["default", "missing-assets", "wide-logo"],
  "card-collage-dof": ["default", "missing-assets"],
  "big-stat-proof": ["default", "long-text"],
  "template-carousel": ["default", "missing-assets", "bad-crop"],
};

export const WAVE1_LIBRARY_BLOCK_IDS = new Set(Object.keys(WAVE1_REQUIRED_SCENARIOS));

export function getWave1RecommendedScenarios(blockId: string): PlaygroundTestScenario[] {
  return WAVE1_REQUIRED_SCENARIOS[blockId] ?? ["default"];
}

export function isWave1RecommendedScenario(
  blockId: string,
  scenario: PlaygroundTestScenario,
): boolean {
  return getWave1RecommendedScenarios(blockId).includes(scenario);
}

const WAVE1_LONG = {
  headline: "Transform your entire workflow with intelligent automation at scale",
  subhead: "Our platform delivers measurable results through advanced analytics and seamless integrations",
  body: "When we started this journey, we knew that building something truly transformative would require rethinking every assumption about modern teams.",
  statWrapper: "You get {stat} of that revenue for the first year when you partner with us on every launch",
  statValue: "50%",
  promptText: "I want to create a website for my fashion brand that showcases our entire seasonal collection",
  hintText: "First, tell us what you are building and who it is for",
  cta: "Start your free trial today",
  url: "yourbrand.com/get-started",
};

const WAVE1_SHORT = {
  headline: "Ship faster",
  subhead: "Motion made simple",
  body: "Brief copy.",
  statWrapper: "You get {stat} revenue",
  statValue: "50%",
  promptText: "Build my site",
  hintText: "What are you building?",
  cta: "Go",
  url: "brand.co",
};

/** Default slot content for wave-1 library blocks in the playground. */
export const WAVE1_SLOT_DEFAULTS: Record<string, Record<string, string>> = {
  "editorial-statement": {
    headline: "You can make serious money.",
    subhead: "",
    accentWord: "money",
  },
  "big-stat-proof": {
    statValue: "50%",
    statWrapper: "You get {stat} of that revenue for the first year",
    stepLabel: "1 Premium Templates",
    showStepRail: "false",
  },
  "brand-payoff": {
    logoText: "SCATTER",
    cta: "Get started today",
    url: "scatter.dev",
    showUrl: "true",
  },
  "hero-split-text-media": {
    headline: "Easy scheduling ahead",
    subhead: "Everything you need to launch faster.",
    body: "",
    media: "",
    cta: "Get started",
  },
  "centered-ui-feature": {
    headline: "Create Image",
    body: "Describe what you want to generate.",
    inputText: "A website for my brand",
    cta: "Create",
    showStepRail: "true",
    stepLabel: "1 Premium Templates",
  },
  "hero-prompt-bar": {
    hintText: "First, what are you building?",
    promptText: "I want to create a website for my fashion brand",
    highlightPhrase: "fashion brand",
    backgroundImage: "",
  },
  "card-collage-dof": {
    headline: "",
    stepLabel: "1 Premium Templates",
    "card-1-title": "Project Recap",
    "card-2-title": "Q4 Proposal",
    "card-3-title": "Essay Prep",
    heroCardIndex: "1",
  },
  "template-carousel": {
    categoryLabel: "1 Premium Templates",
    "item-1-title": "In-House",
    "item-1-meta": "$49",
    "item-2-title": "Freelancer",
    "item-2-meta": "$89",
    "item-3-title": "Agency",
    "item-3-meta": "$149",
    activeIndex: "1",
  },
};

/** Editor block ids map 1:1 to wave-1 library entries for scenario lookup. */
export const WAVE1_EDITOR_TO_LIBRARY: Record<string, string> = {
  "editorial-statement": "editorial-statement",
  "big-stat-proof": "big-stat-proof",
  "brand-payoff": "brand-payoff",
  "hero-split-text-media": "hero-split-text-media",
  "centered-ui-feature": "centered-ui-feature",
  "hero-prompt-bar": "hero-prompt-bar",
  "card-collage-dof": "card-collage-dof",
  "template-carousel": "template-carousel",
};

export function resolveWave1LibraryBlockId(blockOrEditorId: string): string | undefined {
  if (WAVE1_SLOT_DEFAULTS[blockOrEditorId]) return blockOrEditorId;
  return WAVE1_EDITOR_TO_LIBRARY[blockOrEditorId];
}

export function buildWave1SlotContent(
  blockId: string,
  scenario: PlaygroundTestScenario,
  logoText: string,
): Record<string, string> | null {
  const libraryId = resolveWave1LibraryBlockId(blockId);
  if (!libraryId) return null;

  const base = { ...WAVE1_SLOT_DEFAULTS[libraryId] };
  const long = scenario === "long-text";
  const short = scenario === "short-text";

  if (long) {
    if ("headline" in base) base.headline = WAVE1_LONG.headline;
    if ("subhead" in base) base.subhead = WAVE1_LONG.subhead;
    if ("body" in base) base.body = WAVE1_LONG.body;
    if ("statWrapper" in base) base.statWrapper = WAVE1_LONG.statWrapper;
    if ("promptText" in base) base.promptText = WAVE1_LONG.promptText;
    if ("hintText" in base) base.hintText = WAVE1_LONG.hintText;
    if ("cta" in base) base.cta = WAVE1_LONG.cta;
    if ("url" in base) base.url = WAVE1_LONG.url;
  }

  if (short) {
    if ("headline" in base) base.headline = WAVE1_SHORT.headline;
    if ("subhead" in base) base.subhead = WAVE1_SHORT.subhead;
    if ("body" in base) base.body = WAVE1_SHORT.body;
    if ("statWrapper" in base) base.statWrapper = WAVE1_SHORT.statWrapper;
    if ("promptText" in base) base.promptText = WAVE1_SHORT.promptText;
    if ("hintText" in base) base.hintText = WAVE1_SHORT.hintText;
    if ("cta" in base) base.cta = WAVE1_SHORT.cta;
    if ("url" in base) base.url = WAVE1_SHORT.url;
  }

  if (scenario === "missing-assets") {
    if ("media" in base) base.media = "";
    if ("uiScreenshot" in base) base.uiScreenshot = "";
    if ("backgroundImage" in base) base.backgroundImage = "";
    if (libraryId === "brand-payoff") base.logoText = logoText;
    if (libraryId === "card-collage-dof") {
      delete base["card-2-title"];
      delete base["card-3-title"];
    }
    if (libraryId === "template-carousel") {
      base["item-2-title"] = "";
      base["item-3-title"] = "";
    }
  }

  if (libraryId === "brand-payoff" && base.logoText === undefined) {
    base.logoText = logoText;
  }

  return base;
}

export function buildWave1AssetPresence(
  blockId: string,
  scenario: PlaygroundTestScenario,
): Record<string, boolean> | null {
  const libraryId = resolveWave1LibraryBlockId(blockId);
  if (!libraryId) return null;

  if (scenario === "missing-assets") {
    if (libraryId === "card-collage-dof") {
      return { "card-1-image": true };
    }
    if (libraryId === "template-carousel") {
      return { "item-1-media": true };
    }
    return {};
  }

  const presence: Record<string, boolean> = {
    "feature-media": true,
    "hero-bg": true,
    "ui-shot": true,
    "card-1-image": true,
    "card-2-image": true,
    "card-3-image": true,
    "item-1-media": true,
    "item-2-media": true,
    "item-3-media": true,
    "brand-logo": true,
  };

  if (scenario === "bad-crop") {
    presence["sample-bad-crop"] = true;
  }

  return presence;
}
