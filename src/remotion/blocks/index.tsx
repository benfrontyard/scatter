import type {
  BrandPreset,
  MotionBlockDefinition,
  MotionBlockInstance,
  MotionFormat,
  ProjectAsset,
} from "@/types";
import type { FC } from "react";
import { CtaLockupBlock } from "./cta-lockup";
import { EditorialStatementBlock } from "./editorial-statement";
import { BigStatProofBlock } from "./big-stat-proof";
import { BrandPayoffBlock } from "./brand-payoff";
import { CardCollageDofBlock } from "./card-collage-dof";
import { CenteredUiFeatureBlock } from "./centered-ui-feature";
import { FeatureAnnouncementBlock } from "./feature-announcement";
import { HeroPromptBarBlock } from "./hero-prompt-bar";
import { HeroSplitTextMediaBlock } from "./hero-split-text-media";
import { LogoRevealBlock } from "./logo-reveal";
import { StatCardBlock } from "./stat-card";
import { TemplateCarouselBlock } from "./template-carousel";

export type BlockRendererProps = {
  brand: BrandPreset;
  block: MotionBlockInstance;
  definition: MotionBlockDefinition;
  format: MotionFormat;
  assets?: ProjectAsset[];
};

const blockRenderers: Record<string, FC<BlockRendererProps>> = {
  "logo-reveal": LogoRevealBlock,
  "feature-announcement": FeatureAnnouncementBlock,
  "stat-card": StatCardBlock,
  "cta-lockup": CtaLockupBlock,
  "editorial-statement": EditorialStatementBlock,
  "big-stat-proof": BigStatProofBlock,
  "brand-payoff": BrandPayoffBlock,
  "hero-split-text-media": HeroSplitTextMediaBlock,
  "centered-ui-feature": CenteredUiFeatureBlock,
  "hero-prompt-bar": HeroPromptBarBlock,
  "card-collage-dof": CardCollageDofBlock,
  "template-carousel": TemplateCarouselBlock,
};

export function renderBlockContent(props: BlockRendererProps) {
  const Renderer = blockRenderers[props.definition.id];
  if (!Renderer) return null;
  return <Renderer {...props} />;
}
