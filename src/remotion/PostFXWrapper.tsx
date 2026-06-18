import { normalizePostFXSettings, resolveActivePostFXEffects } from "@/lib/post-fx";
import {
  buildPostFXContentStyles,
  buildPostFXOverlays,
} from "@/motion/post-fx";
import type { PostFXRenderMode, PostFXSettings } from "@/types/post-fx";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { ReactNode } from "react";

type PostFXWrapperProps = {
  postFx?: PostFXSettings;
  renderMode: PostFXRenderMode;
  children: ReactNode;
};

export function PostFXWrapper({ postFx, renderMode, children }: PostFXWrapperProps) {
  const frame = useCurrentFrame();
  const settings = normalizePostFXSettings(postFx);
  const effects = resolveActivePostFXEffects(settings, renderMode);

  if (!settings.enabled || effects.length === 0) {
    return <AbsoluteFill>{children}</AbsoluteFill>;
  }

  const contentStyles = buildPostFXContentStyles(
    effects,
    renderMode,
    settings.previewQuality,
    settings.exportQuality,
  );

  const overlays = buildPostFXOverlays(
    effects,
    frame,
    renderMode,
    settings.previewQuality,
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
