import type { BrandMotionKit } from "@/data/fakeBrands/types";
import {
  brandThemeStyle,
  getBrandSlug,
  type MotionPreviewVariant,
} from "@/components/studio/fake-brands/brand-theme";
import { PreviewScene } from "@/components/studio/fake-brands/PreviewScenes";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils";
import "./fake-brand-preview.css";

type MotionPreviewCardProps = {
  kit: BrandMotionKit;
  variant: MotionPreviewVariant;
  label: string;
  featured?: boolean;
  className?: string;
};

export function MotionPreviewCard({
  kit,
  variant,
  label,
  featured = false,
  className,
}: MotionPreviewCardProps) {
  const reducedMotion = useReducedMotion();
  const slug = getBrandSlug(kit);
  const hasGrain = (kit.motionKit.effects.grain?.intensity ?? 0) > 0;
  const hasVignette = (kit.motionKit.effects.vignette?.intensity ?? 0) > 0;
  const timing = kit.motionKit.timingScale;

  return (
    <article className={cn("group space-y-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <h4 className={cn("font-medium", featured ? "text-xs" : "text-[11px] text-muted-foreground")}>
          {label}
        </h4>
        <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
          {timing.standard}ms
        </span>
      </div>

      <div
        className={cn(
          "fake-brand-preview",
          `fake-brand-preview--brand-${slug}`,
          `fake-brand-preview--${variant}`,
          reducedMotion && "fake-brand-preview--reduced",
          hasGrain && "fake-brand-preview__grain",
          hasVignette && "fake-brand-preview__vignette",
          featured && "ring-1 ring-border transition-shadow group-hover:shadow-md",
        )}
        style={{
          ...brandThemeStyle(kit),
          ...(featured && {
            boxShadow: `0 0 0 1px color-mix(in srgb, ${kit.identity.colors.accent?.hex ?? "#000"} 20%, transparent)`,
          }),
        }}
      >
        <div
          className={cn(
            "fake-brand-preview__frame",
            featured ? "aspect-[16/10]" : "aspect-video",
          )}
        >
          <div className="fake-brand-preview__stage h-full">
            <PreviewScene kit={kit} variant={variant} reducedMotion={reducedMotion} />
          </div>
        </div>
      </div>

      {featured ? (
        <p className="text-[10px] leading-snug text-muted-foreground">
          {kit.motionKit.blockDefaults[
            variant === "websiteHero"
              ? "intro"
              : variant === "productUiReveal"
                ? "featureCallout"
                : variant === "statCard"
                  ? "statCard"
                  : variant === "ctaEndCard"
                    ? "ctaEndCard"
                    : "intro"
          ] ?? kit.motionKit.motionPersonality}
        </p>
      ) : null}
    </article>
  );
}
