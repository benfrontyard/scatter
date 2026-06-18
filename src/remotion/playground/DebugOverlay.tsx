import { resolveMotionSafeAreas } from "@/config/motion/safe-areas";
import type {
  MotionAspectRatio,
  MotionBlockLibraryEntry,
  PlaygroundDebugLayer,
} from "@/types/motion-block-library";
import { getLayoutForFormat } from "@/lib/motion-block-library";
import { AbsoluteFill } from "remotion";

type DebugOverlayProps = {
  block: MotionBlockLibraryEntry;
  aspectRatio: MotionAspectRatio;
  width: number;
  height: number;
  layers: PlaygroundDebugLayer[];
};

const LAYER_COLORS: Record<string, string> = {
  "canvas-bounds": "rgba(255,255,255,0.6)",
  "hard-safe": "rgba(239,68,68,0.35)",
  "soft-safe": "rgba(250,204,21,0.25)",
  "vertical-danger": "rgba(249,115,22,0.3)",
  "text-boxes": "rgba(96,165,250,0.3)",
  "media-crops": "rgba(168,85,247,0.3)",
  "logo-boxes": "rgba(34,197,94,0.3)",
  "slot-labels": "rgba(255,255,255,0.9)",
  "motion-paths": "rgba(59,130,246,0.7)",
  "anchor-points": "rgba(244,63,94,0.9)",
};

function Box({
  left,
  top,
  width,
  height,
  color,
  borderStyle = "dashed",
  label,
}: {
  left: number;
  top: number;
  width: number;
  height: number;
  color: string;
  borderStyle?: "dashed" | "solid";
  label?: string;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width,
        height,
        border: `2px ${borderStyle} ${color}`,
        pointerEvents: "none",
        boxSizing: "border-box",
      }}
    >
      {label ? (
        <span
          style={{
            position: "absolute",
            top: 2,
            left: 4,
            fontSize: 10,
            fontFamily: "monospace",
            color,
            background: "rgba(0,0,0,0.5)",
            padding: "1px 4px",
            borderRadius: 2,
          }}
        >
          {label}
        </span>
      ) : null}
    </div>
  );
}

export function DebugOverlay({ block, aspectRatio, width, height, layers }: DebugOverlayProps) {
  const safe = resolveMotionSafeAreas(aspectRatio, block.safeAreas.respectVerticalDanger);
  const layout = getLayoutForFormat(block, aspectRatio);
  const layerSet = new Set(layers);

  const inset = (frac: { top: number; right: number; bottom: number; left: number }) => ({
    left: frac.left * width,
    top: frac.top * height,
    w: width * (1 - frac.left - frac.right),
    h: height * (1 - frac.top - frac.bottom),
  });

  const hard = inset(safe.hard);
  const soft = inset(safe.soft);
  const readable = {
    left: safe.readableCenter.x * width,
    top: safe.readableCenter.y * height,
    w: safe.readableCenter.width * width,
    h: safe.readableCenter.height * height,
  };

  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 100 }}>
      {layerSet.has("canvas-bounds") ? (
        <Box left={0} top={0} width={width} height={height} color={LAYER_COLORS["canvas-bounds"]} borderStyle="solid" label="canvas" />
      ) : null}

      {layerSet.has("hard-safe") ? (
        <Box {...{ left: hard.left, top: hard.top, width: hard.w, height: hard.h }} color={LAYER_COLORS["hard-safe"]} label="hard safe" />
      ) : null}

      {layerSet.has("soft-safe") ? (
        <Box {...{ left: soft.left, top: soft.top, width: soft.w, height: soft.h }} color={LAYER_COLORS["soft-safe"]} label="soft safe" />
      ) : null}

      {layerSet.has("vertical-danger") && safe.verticalDanger ? (
        <>
          <Box left={0} top={0} width={width} height={safe.verticalDanger.top * height} color={LAYER_COLORS["vertical-danger"]} label="top danger" />
          <Box
            left={0}
            top={height * (1 - safe.verticalDanger.bottom)}
            width={width}
            height={safe.verticalDanger.bottom * height}
            color={LAYER_COLORS["vertical-danger"]}
            label="bottom danger"
          />
        </>
      ) : null}

      {layout?.slots.map((slot) => {
        const slotDef = block.slots.find((s) => s.id === slot.slotId);
        if (!slotDef) return null;
        const left = slot.anchor.x * width;
        const top = slot.anchor.y * height;
        const w = slot.width * width;
        const h = slot.height * height;

        const isMedia = slotDef.type === "media" || slotDef.type === "chart";
        const isLogo = slotDef.type === "logo";
        const isText = slotDef.type === "text" || slotDef.type === "stat" || slotDef.type === "cta";

        const showBox =
          (isText && layerSet.has("text-boxes")) ||
          (isMedia && layerSet.has("media-crops")) ||
          (isLogo && layerSet.has("logo-boxes"));

        const color = isMedia
          ? LAYER_COLORS["media-crops"]
          : isLogo
            ? LAYER_COLORS["logo-boxes"]
            : LAYER_COLORS["text-boxes"];

        return (
          <div key={slot.slotId}>
            {showBox ? (
              <Box left={left} top={top} width={w} height={h} color={color} label={layerSet.has("slot-labels") ? slot.slotId : undefined} />
            ) : null}
            {layerSet.has("anchor-points") ? (
              <div
                style={{
                  position: "absolute",
                  left: left - 4,
                  top: top - 4,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: LAYER_COLORS["anchor-points"],
                }}
              />
            ) : null}
            {layerSet.has("motion-paths") ? (
              <div
                style={{
                  position: "absolute",
                  left: left + w / 2,
                  top: top - 24,
                  width: 2,
                  height: 24,
                  background: LAYER_COLORS["motion-paths"],
                }}
              />
            ) : null}
          </div>
        );
      })}

      {layerSet.has("soft-safe") && block.safeAreas.readableCenter ? (
        <Box
          left={readable.left}
          top={readable.top}
          width={readable.w}
          height={readable.h}
          color="rgba(52,211,153,0.25)"
          label="readable center"
        />
      ) : null}
    </AbsoluteFill>
  );
}
