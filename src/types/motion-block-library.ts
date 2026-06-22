/** Block families group related motion patterns. */
export type MotionBlockFamily =
  | "image-video"
  | "ui-product"
  | "data-graph"
  | "typography"
  | "illustration-icon"
  | "brand-system";

export type MotionBlockStatus =
  | "draft"
  | "candidate"
  | "needs-review"
  | "ready-to-publish"
  | "published"
  | "deprecated"
  /** @deprecated Use `published`. Kept for existing blocks.ts entries. */
  | "approved";

export type MotionAspectRatio = "16:9" | "9:16" | "1:1" | "4:5";

export type MotionSlotType =
  | "text"
  | "media"
  | "logo"
  | "icon"
  | "chart"
  | "stat"
  | "cta"
  | "shape";

export type MotionSlotRole =
  | "headline"
  | "subhead"
  | "body"
  | "quote"
  | "attribution"
  | "stat-value"
  | "stat-label"
  | "media-primary"
  | "media-secondary"
  | "logo"
  | "cta"
  | "icon"
  | "chart"
  | "caption";

export type MotionBlockSlot = {
  id: string;
  type: MotionSlotType;
  role: MotionSlotRole;
  label: string;
  required: boolean;
  /** Max character count before warnings fire */
  maxLength?: number;
  /** Min font size as fraction of format height */
  minReadableSize?: number;
};

export type MotionAssetKind = "image" | "video" | "logo" | "icon" | "chart-data";

export type MotionAssetRequirement = {
  id: string;
  kind: MotionAssetKind;
  label: string;
  slotId?: string;
  /** Aspect ratio hint for crop validation */
  aspectHint?: string;
};

export type MotionAnchor = {
  x: number;
  y: number;
};

export type MotionSlotLayout = {
  slotId: string;
  zone: string;
  anchor: MotionAnchor;
  width: number;
  height: number;
  zIndex?: number;
};

export type MotionLayoutRule = {
  slots: MotionSlotLayout[];
  mediaTreatment?: "full-bleed" | "contained" | "split" | "collage" | "background";
  stackDirection?: "column" | "row";
  gap?: number;
};

export type MotionSafeAreaRule = {
  hardSafe: boolean;
  softSafe: boolean;
  respectVerticalDanger?: boolean;
  readableCenter?: boolean;
};

export type MotionResponsiveRule = {
  /** Scale text down when content exceeds maxLength */
  autoShrinkText?: boolean;
  /** Reflow slots for narrow formats */
  reflowOnVertical?: boolean;
  /** Hide optional slots when space is tight */
  hideOptionalOnTight?: boolean;
  /** Max visible elements before warning */
  maxElements?: number;
};

export type MotionPhasePreset = {
  in: string;
  main: string;
  out: string;
  inRatio: number;
  mainRatio: number;
  outRatio: number;
};

export type MotionPreset = {
  phases: MotionPhasePreset;
  easingId: string;
  entranceEasingId?: string;
  exitEasingId?: string;
  stagger: number;
  controls: Record<string, number | string>;
};

export type MotionStylePreset = {
  textAlign?: "left" | "center" | "right";
  emphasis?: "subtle" | "standard" | "hero";
  contrast?: "auto" | "high" | "low";
};

export type MotionFallbackRule = {
  missingMedia?: "color-fill" | "gradient" | "blur-placeholder" | "hide" | "icon-placeholder";
  missingLogo?: "text-fallback" | "hide" | "icon-placeholder";
  missingText?: "hide-slot" | "placeholder";
  longText?: "truncate" | "shrink" | "wrap";
  badCrop?: "center-crop" | "contain" | "top-focus";
};

export type MotionAdvancedOverride = {
  breakGrid?: boolean;
  customEasing?: string;
  durationScale?: number;
  slotOverrides?: Record<string, Partial<MotionSlotLayout>>;
};

export type MotionDebugMetadata = {
  author?: string;
  version?: string;
  lastReviewed?: string;
  notes?: string;
  rendererId?: string;
};

/** Full motion block library entry — the canonical block schema. */
export type MotionBlockLibraryEntry = {
  id: string;
  name: string;
  description: string;
  family: MotionBlockFamily;
  tags: string[];
  useCases: string[];
  supportedFormats: MotionAspectRatio[];
  duration: number;
  slots: MotionBlockSlot[];
  requiredAssets: MotionAssetRequirement[];
  optionalAssets: MotionAssetRequirement[];
  layoutRules: Partial<Record<MotionAspectRatio, MotionLayoutRule>>;
  safeAreas: MotionSafeAreaRule;
  responsiveRules: MotionResponsiveRule;
  motionPreset: MotionPreset;
  stylePreset: MotionStylePreset;
  fallbackRules: MotionFallbackRule;
  advancedOverrides?: MotionAdvancedOverride;
  debugMetadata?: MotionDebugMetadata;
  status: MotionBlockStatus;
  /** Links to existing editor block renderer when available */
  editorBlockId?: string;
};

export type MotionBlockWarningCode =
  | "text-outside-safe-area"
  | "headline-too-long"
  | "subhead-too-long"
  | "logo-too-wide"
  | "logo-too-tall"
  | "low-contrast"
  | "focal-point-cropped"
  | "missing-required-asset"
  | "too-many-elements"
  | "small-text-unreadable";

export type MotionBlockWarning = {
  code: MotionBlockWarningCode;
  message: string;
  slotId?: string;
  severity: "error" | "warning" | "info";
};

export type PlaygroundTestScenario =
  | "default"
  | "long-text"
  | "short-text"
  | "missing-assets"
  | "wide-logo"
  | "tall-logo"
  | "bad-crop"
  | "low-contrast";

export type PlaygroundDebugLayer =
  | "canvas-bounds"
  | "hard-safe"
  | "soft-safe"
  | "vertical-danger"
  | "text-boxes"
  | "media-crops"
  | "logo-boxes"
  | "slot-labels"
  | "motion-paths"
  | "anchor-points"
  | "responsive-bounds"
  | "text-overflow";

export type PlaygroundPreviewMode = "styled" | "grayscale" | "debug";

/** Bridge type for editor timeline compatibility */
export type MotionBlockLibraryBridge = {
  libraryId: string;
  editorDefinition: import("./motion-block").MotionBlockDefinition;
};
