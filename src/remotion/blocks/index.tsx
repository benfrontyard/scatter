import type {
  BrandPreset,
  MotionBlockDefinition,
  MotionBlockInstance,
  MotionFormat,
} from "@/types";
import type { FC } from "react";
import { CtaLockupBlock } from "./cta-lockup";
import { FeatureAnnouncementBlock } from "./feature-announcement";
import { LogoRevealBlock } from "./logo-reveal";
import { StatCardBlock } from "./stat-card";

export type BlockRendererProps = {
  brand: BrandPreset;
  block: MotionBlockInstance;
  definition: MotionBlockDefinition;
  format: MotionFormat;
};

const blockRenderers: Record<string, FC<BlockRendererProps>> = {
  "logo-reveal": LogoRevealBlock,
  "feature-announcement": FeatureAnnouncementBlock,
  "stat-card": StatCardBlock,
  "cta-lockup": CtaLockupBlock,
};

export function renderBlockContent(props: BlockRendererProps) {
  const Renderer = blockRenderers[props.definition.id];
  if (!Renderer) return null;
  return <Renderer {...props} />;
}
