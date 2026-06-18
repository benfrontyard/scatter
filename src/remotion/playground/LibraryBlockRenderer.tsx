import { getEasingPreset, getEasingFunction } from "@/lib/easing";
import type { BrandPreset, ProjectAsset } from "@/types";
import type {
  MotionAspectRatio,
  MotionBlockLibraryEntry,
  MotionBlockSlot,
  PlaygroundDebugLayer,
} from "@/types/motion-block-library";
import { getLayoutForFormat } from "@/lib/motion-block-library";
import { AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { DebugOverlay } from "./DebugOverlay";

type LibraryBlockRendererProps = {
  block: MotionBlockLibraryEntry;
  aspectRatio: MotionAspectRatio;
  brand: BrandPreset;
  content: Record<string, string>;
  assets: ProjectAsset[];
  assetPresence: Record<string, boolean>;
  debugLayers: PlaygroundDebugLayer[];
};

function slotOpacity(frame: number, duration: number, index: number, block: MotionBlockLibraryEntry): number {
  const { phases, stagger } = block.motionPreset;
  const inFrames = Math.round(duration * phases.inRatio);
  const delay = index * stagger;
  const local = frame - delay;
  if (local <= 0) return 0;
  if (local >= inFrames) return 1;
  const easing = getEasingFunction(getEasingPreset(block.motionPreset.easingId));
  return interpolate(local, [0, inFrames], [0, 1], { extrapolateRight: "clamp", easing });
}

function slotTransform(frame: number, duration: number, index: number, block: MotionBlockLibraryEntry, height: number): string {
  const { phases, controls } = block.motionPreset;
  const direction = controls.direction === "down" ? -1 : 1;
  const progress = slotOpacity(frame, duration, index, block);

  if (phases.in === "scale-in") {
    const scale = interpolate(progress, [0, 1], [0.85, 1]);
    return `scale(${scale})`;
  }
  if (phases.in === "slide-up" || phases.in === "slide-down") {
    const offset = interpolate(progress, [0, 1], [height * 0.06 * direction, 0]);
    return `translateY(${offset}px)`;
  }
  return "none";
}

function renderSlotContent(
  slot: MotionBlockSlot,
  content: Record<string, string>,
  brand: BrandPreset,
  assets: ProjectAsset[],
  assetPresence: Record<string, boolean>,
  block: MotionBlockLibraryEntry,
) {
  const value = content[slot.id] ?? "";
  const fg = brand.colors.foreground;
  const accent = brand.colors.accent;
  const muted = brand.colors.muted;
  const fontHeading = brand.typography.fontFamilies.heading;
  const fontBody = brand.typography.fontFamilies.body;

  switch (slot.type) {
    case "text":
      return (
        <p
          style={{
            margin: 0,
            color: fg,
            fontFamily: slot.role === "headline" || slot.role === "quote" ? fontHeading : fontBody,
            fontSize:
              slot.role === "headline" || slot.role === "quote"
                ? "clamp(18px, 4vw, 48px)"
                : "clamp(12px, 2.5vw, 24px)",
            fontWeight: slot.role === "headline" ? 700 : 400,
            lineHeight: 1.15,
            textAlign: block.stylePreset.textAlign ?? "left",
            fontStyle: slot.role === "quote" ? "italic" : "normal",
          }}
        >
          {value || slot.label}
        </p>
      );
    case "stat":
      return (
        <p
          style={{
            margin: 0,
            color: accent,
            fontFamily: fontHeading,
            fontSize: "clamp(32px, 8vw, 96px)",
            fontWeight: 800,
            lineHeight: 1,
            textAlign: "center",
          }}
        >
          {value || "—"}
        </p>
      );
    case "cta":
      return (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0.5em 1.25em",
            borderRadius: 8,
            background: accent,
            color: brand.colors.background,
            fontFamily: fontBody,
            fontSize: "clamp(12px, 2vw, 18px)",
            fontWeight: 600,
          }}
        >
          {value || "CTA"}
        </div>
      );
    case "logo":
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            color: fg,
            fontFamily: fontHeading,
            fontSize: "clamp(20px, 5vw, 56px)",
            fontWeight: 700,
            letterSpacing: "0.04em",
          }}
        >
          {value || brand.logos.textFallback}
        </div>
      );
    case "media": {
      const asset = assets[0];
      const hasAsset = assetPresence["hero-media"] || assetPresence["feature-media"] || assetPresence["ui-screenshot"] || asset;
      if (!hasAsset) {
        const fallback = block.fallbackRules.missingMedia ?? "color-fill";
        if (fallback === "hide") return null;
        return (
          <div
            style={{
              width: "100%",
              height: "100%",
              background: fallback === "gradient" ? `linear-gradient(135deg, ${accent}, ${muted})` : muted,
              borderRadius: 8,
              opacity: 0.6,
            }}
          />
        );
      }
      const src = assets.find((a) => a.type === "image")?.dataUrl;
      if (src) {
        return (
          <Img
            src={src}
            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }}
          />
        );
      }
      return (
        <div style={{ width: "100%", height: "100%", background: accent, opacity: 0.3, borderRadius: 8 }} />
      );
    }
    case "chart":
      return (
        <svg viewBox="0 0 200 100" style={{ width: "100%", height: "100%" }}>
          <polyline
            fill="none"
            stroke={accent}
            strokeWidth="3"
            points="10,80 50,60 90,45 130,30 190,15"
          />
        </svg>
      );
    case "icon":
      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 12,
            background: `${accent}22`,
            color: accent,
            fontSize: "clamp(20px, 4vw, 40px)",
          }}
        >
          ◆
        </div>
      );
    default:
      return null;
  }
}

export function LibraryBlockRenderer({
  block,
  aspectRatio,
  brand,
  content,
  assets,
  assetPresence,
  debugLayers,
}: LibraryBlockRendererProps) {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();
  const layout = getLayoutForFormat(block, aspectRatio);
  const bg = brand.colors.background;

  if (!layout) return <AbsoluteFill style={{ background: bg }} />;

  return (
    <AbsoluteFill style={{ background: bg }}>
      {layout.slots.map((slotLayout, index) => {
        const slotDef = block.slots.find((s) => s.id === slotLayout.slotId);
        if (!slotDef) return null;

        const opacity = slotOpacity(frame, durationInFrames, index, block);
        const transform = slotTransform(frame, durationInFrames, index, block, height);

        return (
          <div
            key={slotLayout.slotId}
            style={{
              position: "absolute",
              left: slotLayout.anchor.x * width,
              top: slotLayout.anchor.y * height,
              width: slotLayout.width * width,
              height: slotLayout.height * height,
              zIndex: slotLayout.zIndex ?? 1,
              opacity,
              transform,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {renderSlotContent(slotDef, content, brand, assets, assetPresence, block)}
          </div>
        );
      })}

      {debugLayers.length > 0 ? (
        <DebugOverlay
          block={block}
          aspectRatio={aspectRatio}
          width={width}
          height={height}
          layers={debugLayers}
        />
      ) : null}
    </AbsoluteFill>
  );
}
