import type { BlockLayoutIntent } from "@/types/block-layout";
import type { TypographyRoleName } from "@/types/typography-role";

/** Default layout intent per block definition id. */
export const blockLayoutIntents: Record<string, BlockLayoutIntent> = {
  "logo-reveal": "logo-lockup",
  "feature-announcement": "product-feature",
  "product-carousel": "list",
  "stat-card": "stat",
  "cta-lockup": "outro",
  "editorial-statement": "statement",
  "big-stat-proof": "stat",
  "brand-payoff": "outro",
  "hero-split-text-media": "product-feature",
  "centered-ui-feature": "product-feature",
  "hero-prompt-bar": "hero",
  "card-collage-dof": "list",
  "template-carousel": "list",
};

/** Typography role mapping per block content slot. */
export const blockContentSlotRoles: Record<string, Record<string, TypographyRoleName>> = {
  "logo-reveal": {
    headline: "heading",
    body: "caption",
    tagline: "caption",
  },
  "feature-announcement": {
    headline: "heading",
    subhead: "body",
    body: "body",
    label: "label",
  },
  "product-carousel": {
    title: "subheading",
    itemOne: "body",
    itemTwo: "body",
    itemThree: "body",
  },
  "stat-card": {
    value: "stat",
    label: "label",
    supportingText: "caption",
  },
  "cta-lockup": {
    message: "subheading",
    cta: "label",
    url: "caption",
    logoText: "label",
  },
  "editorial-statement": {
    headline: "display",
    subhead: "body",
  },
  "big-stat-proof": {
    statWrapper: "heading",
    statValue: "stat",
    stepLabel: "label",
  },
  "brand-payoff": {
    cta: "subheading",
    url: "caption",
    logoText: "label",
  },
  "hero-split-text-media": {
    headline: "heading",
    subhead: "body",
    body: "body",
    cta: "label",
  },
  "centered-ui-feature": {
    headline: "heading",
    body: "body",
    inputText: "body",
    cta: "label",
    stepLabel: "caption",
  },
  "hero-prompt-bar": {
    hintText: "caption",
    promptText: "body",
    highlightPhrase: "body",
  },
  "card-collage-dof": {
    headline: "subheading",
    stepLabel: "caption",
  },
  "template-carousel": {
    categoryLabel: "caption",
    headline: "subheading",
    meta: "caption",
  },
};

export function resolveBlockLayoutIntent(
  blockId: string,
  explicitIntent?: BlockLayoutIntent,
): BlockLayoutIntent {
  return explicitIntent ?? blockLayoutIntents[blockId] ?? "statement";
}

export function resolveBlockContentSlotRoles(
  blockId: string,
): Record<string, TypographyRoleName> {
  return blockContentSlotRoles[blockId] ?? { headline: "heading", body: "body" };
}
