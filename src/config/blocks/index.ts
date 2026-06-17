import type { BlockCategory, MotionBlockDefinition } from "@/types";

const ALL_FORMAT_IDS = ["format-9-16", "format-1-1", "format-4-5", "format-16-9"];

export const blockCategories: { id: BlockCategory; label: string }[] = [
  { id: "intro", label: "Intro" },
  { id: "logo", label: "Logo" },
  { id: "product", label: "Product" },
  { id: "proof", label: "Proof" },
  { id: "cta", label: "CTA" },
];

export const motionBlockDefinitions: MotionBlockDefinition[] = [
  {
    id: "logo-reveal",
    name: "Logo Reveal",
    category: "intro",
    description: "Introduce the brand mark with a confident entrance.",
    defaultDuration: 90,
    defaultContent: {
      logoText: "SCATTER",
      tagline: "Motion made simple",
    },
    defaultMotion: {
      phases: {
        in: "hold",
        main: "hold",
        out: "hold",
        inRatio: 0.35,
        mainRatio: 0.4,
        outRatio: 0.25,
      },
      controls: {
        direction: "up",
        intensity: "standard",
        speed: "standard",
        stagger: 6,
      },
    },
    supportedFormats: ALL_FORMAT_IDS,
    compatibleTransitions: ["cut", "crossfade", "push", "mask-reveal"],
  },
  {
    id: "feature-announcement",
    name: "Feature Announcement",
    category: "product",
    description: "Highlight a product feature with headline, subhead, and screenshot.",
    defaultDuration: 120,
    defaultContent: {
      headline: "Introducing Scatter",
      subhead: "Build branded motion in minutes, not days.",
      logoText: "SCATTER",
      backgroundColor: "",
      accentColor: "",
    },
    defaultMotion: {
      phases: {
        in: "hold",
        main: "hold",
        out: "hold",
        inRatio: 0.4,
        mainRatio: 0.45,
        outRatio: 0.15,
      },
      controls: {
        direction: "up",
        intensity: "standard",
        speed: "standard",
        stagger: 8,
      },
    },
    supportedFormats: ALL_FORMAT_IDS,
    compatibleTransitions: ["crossfade", "push", "wipe", "mask-reveal", "scale-through"],
  },
  {
    id: "product-carousel",
    name: "Product Carousel",
    category: "product",
    description: "Cycle through product shots with smooth transitions.",
    defaultDuration: 150,
    defaultContent: {
      title: "Our products",
      itemOne: "Product A",
      itemTwo: "Product B",
      itemThree: "Product C",
    },
    defaultMotion: {
      phases: {
        in: "fade",
        main: "hold",
        out: "fade-out",
        inRatio: 0.2,
        mainRatio: 0.6,
        outRatio: 0.2,
      },
      controls: {
        slideSpeed: 1,
      },
    },
    supportedFormats: ALL_FORMAT_IDS,
    compatibleTransitions: ["crossfade", "push", "wipe", "frame-split"],
  },
  {
    id: "stat-card",
    name: "Stat Card",
    category: "proof",
    description: "Present a key metric with emphasis.",
    defaultDuration: 90,
    defaultContent: {
      value: "10x",
      label: "Faster production",
      supportingText: "From brief to export in minutes",
    },
    defaultMotion: {
      phases: {
        in: "hold",
        main: "hold",
        out: "hold",
        inRatio: 0.25,
        mainRatio: 0.55,
        outRatio: 0.2,
      },
      controls: {
        direction: "up",
        intensity: "hero",
        speed: "standard",
        stagger: 8,
        emphasis: 1.1,
      },
    },
    supportedFormats: ALL_FORMAT_IDS,
    compatibleTransitions: ["crossfade", "push", "scale-through"],
  },
  {
    id: "cta-lockup",
    name: "CTA Lockup",
    category: "cta",
    description: "Close with a call to action and brand lockup.",
    defaultDuration: 90,
    defaultContent: {
      message: "Ready to ship branded motion?",
      cta: "Get started",
      url: "scatter.dev",
      logoText: "SCATTER",
    },
    defaultMotion: {
      phases: {
        in: "hold",
        main: "hold",
        out: "hold",
        inRatio: 0.3,
        mainRatio: 0.55,
        outRatio: 0.15,
      },
      controls: {
        direction: "up",
        intensity: "standard",
        speed: "calm",
        stagger: 7,
        buttonScale: 1,
      },
    },
    supportedFormats: ALL_FORMAT_IDS,
    compatibleTransitions: ["cut", "crossfade", "mask-reveal"],
  },
];

export const motionBlockMap = Object.fromEntries(
  motionBlockDefinitions.map((block) => [block.id, block]),
) as Record<string, MotionBlockDefinition>;
