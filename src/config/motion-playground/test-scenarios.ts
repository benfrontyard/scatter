import type { ProjectAsset } from "@/types";
import type { PlaygroundTestScenario } from "@/types/motion-block-library";

/** 1x1 PNG placeholders as data URLs */
const PLACEHOLDER_IMAGE =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect fill="%236366f1" width="800" height="600"/><text x="400" y="300" text-anchor="middle" fill="white" font-size="32" font-family="sans-serif">Sample</text></svg>`,
  );

const BAD_CROP_IMAGE =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="800" viewBox="0 0 400 800"><rect fill="%23f59e0b" width="400" height="800"/><circle cx="200" cy="200" r="80" fill="%23ef4444"/><text x="200" y="500" text-anchor="middle" fill="white" font-size="20">Focal top</text></svg>`,
  );

export const playgroundSampleAssets: ProjectAsset[] = [
  { id: "sample-hero", name: "Hero image", type: "image", dataUrl: PLACEHOLDER_IMAGE },
  { id: "sample-ui", name: "UI screenshot", type: "image", dataUrl: PLACEHOLDER_IMAGE },
  { id: "sample-bad-crop", name: "Bad crop", type: "image", dataUrl: BAD_CROP_IMAGE },
  { id: "sample-avatar", name: "Avatar", type: "image", dataUrl: PLACEHOLDER_IMAGE },
];

export const PLAYGROUND_TEST_SCENARIOS: {
  id: PlaygroundTestScenario;
  label: string;
  description: string;
}[] = [
  { id: "default", label: "Default", description: "Standard sample content" },
  { id: "long-text", label: "Long text", description: "Stress-test with verbose copy" },
  { id: "short-text", label: "Short text", description: "Minimal copy" },
  { id: "missing-assets", label: "Missing assets", description: "Simulate absent media" },
  { id: "wide-logo", label: "Wide logo", description: "Horizontal logo shape" },
  { id: "tall-logo", label: "Tall logo", description: "Vertical logo shape" },
  { id: "bad-crop", label: "Bad crop", description: "Off-center focal point" },
  { id: "low-contrast", label: "Low contrast", description: "Poor text contrast" },
];

export const LONG_TEXT_SAMPLES = {
  headline:
    "Transform your entire workflow with intelligent automation that scales across every team and touchpoint in your organization",
  subhead:
    "Our platform delivers measurable results through a combination of advanced analytics, seamless integrations, and human-centered design principles that teams love to use every single day",
  body: "When we started this journey, we knew that building something truly transformative would require rethinking every assumption about how modern teams collaborate, communicate, and create value for their customers in an increasingly complex digital landscape.",
  quote:
    '"This product completely changed how our team operates. We went from spending hours on manual tasks to focusing on what actually matters — creative strategy and meaningful customer relationships."',
  message: "Ready to revolutionize the way your entire organization creates, ships, and measures branded motion content?",
  cta: "Start free trial today",
  value: "10,000,000+",
  label: "Videos created by teams worldwide using our platform",
};

export const SHORT_TEXT_SAMPLES = {
  headline: "Ship faster",
  subhead: "Motion made simple",
  body: "Brief copy.",
  quote: '"Game changer."',
  message: "Get started",
  cta: "Go",
  value: "10x",
  label: "Faster",
};

export function buildSlotContent(
  blockId: string,
  scenario: PlaygroundTestScenario,
  logoText: string,
): Record<string, string> {
  const long = scenario === "long-text";
  const short = scenario === "short-text";
  const samples = long ? LONG_TEXT_SAMPLES : short ? SHORT_TEXT_SAMPLES : null;

  const defaults: Record<string, Record<string, string>> = {
    "full-bleed-media-headline": {
      headline: samples?.headline ?? "Discover what's possible",
      subhead: samples?.subhead ?? "Built for modern brands",
    },
    "editorial-split-media": {
      headline: samples?.headline ?? "The future of motion",
      body: samples?.body ?? "A new way to create branded video at scale.",
    },
    "staggered-image-collage": {
      headline: samples?.headline ?? "Curated moments",
    },
    "ui-card-stack": {
      headline: samples?.headline ?? "Ship features faster",
      subhead: samples?.subhead ?? "Your product, beautifully presented",
    },
    "dashboard-callout": {
      headline: samples?.headline ?? "Insights at a glance",
      "callout-1": "Revenue up 24%",
      "callout-2": "Users +1.2k",
    },
    "big-stat-reveal": {
      value: samples?.value ?? "10x",
      label: samples?.label ?? "Faster production",
      supporting: samples?.subhead ?? "From brief to export in minutes",
    },
    "chart-draw-on": {
      headline: samples?.headline ?? "Growth trajectory",
      caption: "Q4 2025 performance",
    },
    "kinetic-headline": {
      headline: samples?.headline ?? "Motion made simple",
      subhead: samples?.subhead ?? "For every brand, every format",
    },
    "quote-card": {
      quote: samples?.quote ?? '"Scatter transformed our video workflow."',
      attribution: "Alex Chen, Creative Director",
    },
    "icon-grid": {
      headline: samples?.headline ?? "Everything you need",
    },
    "logo-intro": {
      tagline: samples?.subhead ?? "Motion made simple",
    },
    "cta-end-card": {
      message: samples?.message ?? "Ready to ship branded motion?",
      cta: samples?.cta ?? "Get started",
      url: "scatter.dev",
    },
  };

  const content = { ...defaults[blockId] };
  if (blockId === "logo-intro" || defaults[blockId]?.logo !== undefined) {
    content.logo = logoText;
  }
  return content;
}

export function buildAssetPresence(
  _blockId: string,
  scenario: PlaygroundTestScenario,
): Record<string, boolean> {
  if (scenario === "missing-assets") return {};
  return {
    "hero-media": true,
    "feature-media": true,
    "collage-1": true,
    "collage-2": true,
    "collage-3": true,
    "ui-screenshot": true,
    "ui-screenshot-2": true,
    "dashboard-img": true,
    "chart-data": true,
    "avatar-img": true,
    "icon-set": true,
    "brand-logo": true,
  };
}
