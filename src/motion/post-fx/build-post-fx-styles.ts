import type { CSSProperties } from "react";
import type { PostFXEffect, PostFXRenderMode } from "@/types/post-fx";
import { deterministicNoiseSeed, getExportQualityScale, getPreviewQualityScale, scaleValue } from "./quality";

const GRAIN_TEXTURE = `url("data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch"/></filter><rect width="128" height="128" filter="url(%23n)" opacity="0.55"/></svg>',
)}")`;

export type PostFXOverlayLayer = {
  id: string;
  style: CSSProperties;
};

export type PostFXContentStyles = {
  filter?: string;
  transform?: string;
};

export function buildPostFXContentStyles(
  effects: PostFXEffect[],
  renderMode: PostFXRenderMode,
  previewQuality: Parameters<typeof getPreviewQualityScale>[0],
  exportQuality: Parameters<typeof getExportQualityScale>[0],
): PostFXContentStyles {
  const qualityScale =
    renderMode === "export"
      ? getExportQualityScale(exportQuality)
      : getPreviewQualityScale(previewQuality);

  const filters: string[] = [];

  for (const effect of effects) {
    switch (effect.type) {
      case "blur": {
        const amount = Number(effect.settings.amount) / 100;
        const px = scaleValue(amount * 24, qualityScale, 0);
        if (px > 0.1) filters.push(`blur(${px.toFixed(2)}px)`);
        break;
      }
      case "sharpen": {
        const amount = Number(effect.settings.amount) / 100;
        const contrast = 1 + amount * 0.35 * qualityScale;
        const saturate = 1 + amount * 0.15 * qualityScale;
        filters.push(`contrast(${contrast.toFixed(3)}) saturate(${saturate.toFixed(3)})`);
        break;
      }
      case "motionBlur": {
        const amount = Number(effect.settings.amount) / 100;
        const samples = Number(effect.settings.samples) || 8;
        const sampleScale = renderMode === "export" ? samples / 8 : Math.min(4, samples) / 8;
        const px = scaleValue(amount * 18 * sampleScale, qualityScale, 0);
        if (px > 0.1) filters.push(`blur(${px.toFixed(2)}px)`);
        break;
      }
      case "chromaticAberration": {
        const amount = Number(effect.settings.amount) / 100;
        const rgbSplit = Number(effect.settings.rgbSplit) / 100;
        const offset = scaleValue((amount * 6 + rgbSplit * 4) * qualityScale, 1, 0);
        if (offset > 0.2) {
          filters.push(
            `drop-shadow(${offset.toFixed(2)}px 0 0 rgba(255,60,60,0.45))`,
            `drop-shadow(${(-offset).toFixed(2)}px 0 0 rgba(60,120,255,0.45))`,
          );
        }
        break;
      }
      case "glow":
      case "bloom": {
        const intensity = Number(effect.settings.intensity) / 100;
        const radius = Number(effect.settings.radius) / 100;
        const glowPx = scaleValue((intensity * 10 + radius * 14) * qualityScale, 1, 0);
        if (glowPx > 0.5) {
          filters.push(`brightness(${1 + intensity * 0.08 * qualityScale})`);
          filters.push(`blur(${glowPx.toFixed(2)}px)`);
        }
        break;
      }
      case "filmFade": {
        const fade = Number(effect.settings.fade) / 100;
        const matte = Number(effect.settings.matte) / 100;
        filters.push(`brightness(${1 + fade * 0.06}) contrast(${1 - matte * 0.12})`);
        break;
      }
      default:
        break;
    }
  }

  return filters.length > 0 ? { filter: filters.join(" ") } : {};
}

export function buildPostFXOverlays(
  effects: PostFXEffect[],
  frame: number,
  renderMode: PostFXRenderMode,
  previewQuality: Parameters<typeof getPreviewQualityScale>[0],
  exportQuality: Parameters<typeof getExportQualityScale>[0],
): PostFXOverlayLayer[] {
  const qualityScale =
    renderMode === "export"
      ? getExportQualityScale(exportQuality)
      : getPreviewQualityScale(previewQuality);

  const overlays: PostFXOverlayLayer[] = [];

  for (const effect of effects) {
    switch (effect.type) {
      case "vignette": {
        const amount = Number(effect.settings.amount) / 100;
        const size = Number(effect.settings.size) / 100;
        const feather = Number(effect.settings.feather) / 100;
        const roundness = Number(effect.settings.roundness) / 100;
        const color = String(effect.settings.color || "#000000");
        const inner = Math.max(0, size * 70);
        const outer = inner + feather * 45 + 20;
        const rx = 50 + roundness * 25;
        const ry = 50 + (1 - roundness) * 25;

        overlays.push({
          id: effect.id,
          style: {
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            opacity: amount * (effect.opacity ?? 1),
            background: `radial-gradient(ellipse ${rx}% ${ry}% at 50% 50%, transparent ${inner}%, ${color} ${outer}%)`,
            mixBlendMode: (effect.blendMode as CSSProperties["mixBlendMode"]) ?? "multiply",
          },
        });
        break;
      }
      case "grain": {
        const amount = Number(effect.settings.amount) / 100;
        const size = Number(effect.settings.size) / 100;
        const speed = Number(effect.settings.speed) / 100;
        const monochrome = Boolean(effect.settings.monochrome);
        const seed = deterministicNoiseSeed(frame, effect.id);
        const tileSize = Math.round(72 + size * 48 * qualityScale);
        const offsetX = (seed * 1.7 + frame * speed * 2.5) % tileSize;
        const offsetY = (seed * 2.3 + frame * speed * 1.8) % tileSize;

        overlays.push({
          id: effect.id,
          style: {
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            opacity: amount * 0.65 * (effect.opacity ?? 1),
            mixBlendMode:
              (String(effect.settings.blendMode) as CSSProperties["mixBlendMode"]) ??
              (effect.blendMode as CSSProperties["mixBlendMode"]) ??
              "overlay",
            backgroundImage: GRAIN_TEXTURE,
            backgroundSize: `${tileSize}px ${tileSize}px`,
            backgroundPosition: `${offsetX}px ${offsetY}px`,
            filter: monochrome ? "grayscale(1)" : undefined,
          },
        });
        break;
      }
      case "noise": {
        const amount = Number(effect.settings.amount) / 100;
        const speed = Number(effect.settings.speed) / 100;
        const monochrome = Boolean(effect.settings.monochrome);
        const seed = deterministicNoiseSeed(frame + 17, effect.id);
        const tileSize = Math.round(96 * qualityScale);
        const offsetX = (seed + frame * speed * 4) % tileSize;
        const offsetY = (seed * 1.5 + frame * speed * 3) % tileSize;

        overlays.push({
          id: effect.id,
          style: {
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            opacity: amount * 0.5 * (effect.opacity ?? 1),
            mixBlendMode: "soft-light",
            backgroundImage: GRAIN_TEXTURE,
            backgroundSize: `${tileSize}px ${tileSize}px`,
            backgroundPosition: `${offsetX}px ${offsetY}px`,
            filter: monochrome ? "grayscale(1) contrast(1.4)" : "contrast(1.4)",
          },
        });
        break;
      }
      case "colorOverlay": {
        const color = String(effect.settings.color || "#6366f1");
        const opacity = Number(effect.settings.opacity) / 100;

        overlays.push({
          id: effect.id,
          style: {
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            backgroundColor: color,
            opacity: opacity * (effect.opacity ?? 1),
            mixBlendMode:
              (String(effect.settings.blendMode) as CSSProperties["mixBlendMode"]) ??
              (effect.blendMode as CSSProperties["mixBlendMode"]) ??
              "soft-light",
          },
        });
        break;
      }
      case "glow":
      case "bloom": {
        const intensity = Number(effect.settings.intensity) / 100;
        const radius = Number(effect.settings.radius) / 100;
        const threshold = Number(effect.settings.threshold) / 100;
        const colorInfluence =
          effect.type === "glow" ? Number(effect.settings.colorInfluence) / 100 : 0.2;
        const glowOpacity = scaleValue(intensity * (0.35 + (1 - threshold) * 0.25), qualityScale, 0);
        const spread = 30 + radius * 50;

        overlays.push({
          id: `${effect.id}-glow`,
          style: {
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            opacity: glowOpacity * (effect.opacity ?? 1),
            mixBlendMode:
              (String(effect.settings.blendMode) as CSSProperties["mixBlendMode"]) ??
              "screen",
            background: `radial-gradient(circle at 50% 45%, rgba(255,255,255,${0.35 + colorInfluence * 0.3}) 0%, transparent ${spread}%)`,
          },
        });
        break;
      }
      case "filmFade": {
        const fade = Number(effect.settings.fade) / 100;
        const matte = Number(effect.settings.matte) / 100;
        const warmth = Number(effect.settings.warmth) / 100;

        overlays.push({
          id: effect.id,
          style: {
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: `linear-gradient(180deg, rgba(255,248,235,${fade * 0.12 + warmth * 0.08}) 0%, rgba(0,0,0,${matte * 0.18}) 100%)`,
            mixBlendMode: "soft-light",
            opacity: effect.opacity ?? 1,
          },
        });
        break;
      }
      default:
        break;
    }
  }

  return overlays;
}
