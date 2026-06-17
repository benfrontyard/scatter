import type { BlockTypographyOverride, TypeStyleName } from "@/types/typography";

export type BlockTypographySlot = {
  key: keyof BlockTypographyOverride;
  label: string;
  defaultStyle: TypeStyleName;
};

export const blockTypographySlots: Record<string, BlockTypographySlot[]> = {
  "logo-reveal": [
    { key: "headline", label: "Logo", defaultStyle: "headline" },
    { key: "body", label: "Tagline", defaultStyle: "caption" },
  ],
  "feature-announcement": [
    { key: "headline", label: "Headline", defaultStyle: "headline" },
    { key: "body", label: "Subhead", defaultStyle: "body" },
    { key: "label", label: "Logo lockup", defaultStyle: "label" },
  ],
  "stat-card": [
    { key: "display", label: "Stat value", defaultStyle: "display" },
    { key: "label", label: "Label", defaultStyle: "label" },
    { key: "caption", label: "Supporting text", defaultStyle: "caption" },
  ],
  "cta-lockup": [
    { key: "headline", label: "Message", defaultStyle: "title" },
    { key: "title", label: "CTA button", defaultStyle: "label" },
    { key: "label", label: "Logo", defaultStyle: "label" },
    { key: "caption", label: "URL", defaultStyle: "caption" },
  ],
};
