import { normalizePostFXSettings, resolveActivePostFXEffects } from "@/lib/post-fx";
import { previewDisplayState } from "@/lib/playback/preview-display-state";
import {
  buildPostFXContentStyles,
  buildPostFXOverlays,
} from "@/motion/post-fx";
import type { PostFXRenderMode, PostFXSettings, PostFXQuality } from "@/types/post-fx";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { ReactNode } from "react";

type PostFXWrapperProps = {
  postFx?: PostFXSettings;
  renderMode: PostFXRenderMode;
  effectivePreviewQuality?: PostFXQuality;
  isPreviewPlaying?: boolean;
  children: ReactNode;
};

export function PostFXWrapper({
  postFx,
  renderMode,
  effectivePreviewQuality,
  isPreviewPlaying = false,
  children,
}: PostFXWrapperProps) {
  const frame = useCurrentFrame();
  const settings = normalizePostFXSettings(postFx);
  const quality =
    renderMode === "preview"
      ? previewDisplayState.effectiveQuality
      : (effectivePreviewQuality ??
        (settings.previewQuality === "auto" ? "medium" : settings.previewQuality));
  const effects = resolveActivePostFXEffects(settings, renderMode, {
    isPlaying: renderMode === "preview" ? previewDisplayState.isPlaying : isPreviewPlaying,
    effectiveQuality: quality,
  });

  if (!settings.enabled || effects.length === 0) {
    return <AbsoluteFill>{children}</AbsoluteFill>;
  }

  const contentStyles = buildPostFXContentStyles(
    effects,
    renderMode,
    quality,
    settings.exportQuality,
  );

  const overlays = buildPostFXOverlays(
    effects,
    frame,
    renderMode,
    quality,
    settings.exportQuality,
  );

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          ...contentStyles,
          transform: contentStyles.transform,
          willChange: contentStyles.filter ? "filter" : undefined,
        }}
      >
        {children}
      </AbsoluteFill>
      {overlays.map((layer) => (
        <div key={layer.id} aria-hidden style={layer.style} />
      ))}
    </AbsoluteFill>
  );
}
