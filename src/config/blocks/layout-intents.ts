import type { BlockLayoutIntent } from "@/types/block-layout";
import type { TypographyRoleName } from "@/types/typography-role";

/** Default layout intent per block definition id. */
export const blockLayoutIntents: Record<string, BlockLayoutIntent> = {
  "logo-reveal": "logo-lockup",
  "feature-announcement": "product-feature",
  "product-carousel": "list",
  "stat-card": "stat",
  "cta-lockup": "outro",
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
