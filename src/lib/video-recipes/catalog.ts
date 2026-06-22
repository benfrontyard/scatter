import type { CreatePath } from "@/types/create-flow";
import type { VideoRecipe } from "@/types/video-recipe";

export const videoRecipes: VideoRecipe[] = [
  {
    id: "product-launch",
    name: "Product Launch",
    description: "Hook, feature proof, formats, and CTA — a complete launch narrative.",
    category: "marketing",
    useCase: "Launch a new product or feature",
    compatibleFormats: ["format-16-9", "format-9-16", "format-1-1", "format-4-5"],
    defaultFormatId: "format-16-9",
    suggestedProjectName: "Product launch video",
    recommendedBrandKitIds: ["nimbo", "ledgerly"],
    adaptBrandTransitions: true,
    scenes: [
      {
        blockId: "editorial-statement",
        duration: 105,
        content: {
          headline: "Introducing something worth talking about.",
          subhead: "",
          accentWord: "Introducing",
        },
        transitionPresetId: "scale-handoff",
      },
      {
        blockId: "hero-split-text-media",
        duration: 120,
        content: {
          headline: "Show the hero feature in context.",
          subhead: "One clear benefit, one visual proof point.",
          body: "",
          media: "",
          cta: "",
        },
        transitionPresetId: "match-cut",
      },
      {
        blockId: "template-carousel",
        duration: 120,
        content: {
          categoryLabel: "Every format",
          "item-1-title": "16:9 Landscape",
          "item-1-meta": "YouTube",
          "item-2-title": "9:16 Vertical",
          "item-2-meta": "Reels",
          "item-3-title": "1:1 Square",
          "item-3-meta": "Feed",
          activeIndex: "1",
        },
        transitionPresetId: "match-cut",
      },
      {
        blockId: "big-stat-proof",
        duration: 105,
        content: {
          statValue: "3×",
          statWrapper: "Faster time to publish",
          stepLabel: "Proof point",
          showStepRail: "true",
        },
        transitionPresetId: "match-cut",
      },
      {
        blockId: "brand-payoff",
        duration: 90,
        content: {
          logoText: "Your brand",
          cta: "Start creating today.",
          url: "",
          showUrl: "false",
        },
      },
    ],
  },
  {
    id: "brand-intro",
    name: "Brand Intro",
    description: "Logo reveal, editorial statement, and end card for brand awareness.",
    category: "brand",
    useCase: "Introduce your brand identity",
    compatibleFormats: ["format-16-9", "format-9-16", "format-1-1"],
    defaultFormatId: "format-16-9",
    suggestedProjectName: "Brand intro video",
    adaptBrandTransitions: true,
    scenes: [
      {
        blockId: "logo-reveal",
        duration: 90,
        transitionPresetId: "hold-cut",
      },
      {
        blockId: "editorial-statement",
        duration: 120,
        content: {
          headline: "Your story, in motion.",
          subhead: "Consistent brand expression across every channel.",
          accentWord: "motion",
        },
        transitionPresetId: "scale-handoff",
      },
      {
        blockId: "brand-payoff",
        duration: 90,
        content: {
          logoText: "Your brand",
          cta: "Built for marketers who move fast.",
          url: "",
          showUrl: "false",
        },
      },
    ],
  },
  {
    id: "social-teaser",
    name: "Social Teaser",
    description: "Short, punchy vertical-first teaser for social channels.",
    category: "social",
    useCase: "Quick social promo or announcement",
    compatibleFormats: ["format-9-16", "format-1-1", "format-4-5"],
    defaultFormatId: "format-9-16",
    suggestedProjectName: "Social teaser",
    adaptBrandTransitions: true,
    scenes: [
      {
        blockId: "editorial-statement",
        duration: 75,
        content: {
          headline: "Something new is here.",
          subhead: "",
          accentWord: "new",
        },
        transitionPresetId: "match-cut",
      },
      {
        blockId: "cta-lockup",
        duration: 60,
        content: {
          headline: "Learn more",
          subhead: "Link in bio",
          cta: "Get started",
        },
      },
    ],
  },
  {
    id: "blank",
    name: "Blank Canvas",
    description: "Start with an empty timeline and add scenes as you go.",
    category: "custom",
    useCase: "Full creative control from scratch",
    compatibleFormats: ["format-16-9", "format-9-16", "format-1-1", "format-4-5"],
    defaultFormatId: "format-16-9",
    suggestedProjectName: "Untitled video",
    scenes: [],
  },
];

export const videoRecipeMap = Object.fromEntries(
  videoRecipes.map((recipe) => [recipe.id, recipe]),
) as Record<string, VideoRecipe>;

export function getVideoRecipe(id: string): VideoRecipe | undefined {
  return videoRecipeMap[id];
}

export function getRecipesForPath(path: CreatePath | null): VideoRecipe[] {
  if (path === "scratch") return videoRecipes.filter((r) => r.id === "blank");
  if (path === "template") {
    return videoRecipes.filter((r) => r.id !== "blank");
  }
  return videoRecipes;
}
