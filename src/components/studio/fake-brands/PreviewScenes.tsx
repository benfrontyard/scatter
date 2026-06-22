import type { BrandMotionKit } from "@/data/fakeBrands/types";
import { getBrandSlug } from "@/components/studio/fake-brands/brand-theme";
import { useCountUp } from "@/components/studio/fake-brands/use-preview-motion";
import type { MotionPreviewVariant } from "@/components/studio/fake-brands/brand-theme";

type SceneProps = {
  kit: BrandMotionKit;
  reducedMotion: boolean;
};

function LogoRevealScene({ kit }: SceneProps) {
  const slug = getBrandSlug(kit);

  if (slug === "ledgerly") {
    return (
      <div className="fb-scene fb-scene--logo flex h-full flex-col items-center justify-center gap-3 p-5">
        <div
          className="fb-logo-mark fake-brand-preview__el relative flex h-11 w-11 items-center justify-center rounded-lg"
          style={{
            background: `linear-gradient(145deg, var(--brand-accent) 0%, color-mix(in srgb, var(--brand-accent) 60%, #000) 100%)`,
            boxShadow: "0 8px 24px color-mix(in srgb, var(--brand-accent) 35%, transparent)",
          }}
        >
          <span
            className="text-lg font-bold"
            style={{ fontFamily: "var(--brand-display-font)", color: "var(--brand-surface)" }}
          >
            L
          </span>
        </div>
        <div className="fb-logo-wordmark-wrap overflow-hidden">
          <span
            className="fb-logo-wordmark fake-brand-preview__el block text-sm font-semibold tracking-wide"
            style={{ fontFamily: "var(--brand-display-font)", color: "var(--brand-secondary)" }}
          >
            {kit.name}
          </span>
        </div>
        <div
          className="fb-logo-rule fake-brand-preview__el h-px w-16"
          style={{ backgroundColor: "var(--brand-accent)" }}
        />
      </div>
    );
  }

  if (slug === "draftly") {
    return (
      <div className="fb-scene fb-scene--logo flex h-full flex-col items-center justify-center gap-2.5 p-5">
        <div className="relative flex items-end gap-1">
          <div
            className="fb-logo-tile fake-brand-preview__el h-7 w-5 rounded-md"
            style={{ backgroundColor: "var(--brand-accent)", animationDelay: "0ms" }}
          />
          <div
            className="fb-logo-tile fake-brand-preview__el h-9 w-5 rounded-md"
            style={{ backgroundColor: "var(--brand-pop)", animationDelay: "70ms" }}
          />
          <div
            className="fb-logo-tile fake-brand-preview__el h-6 w-5 rounded-md"
            style={{ backgroundColor: "var(--brand-warm)", animationDelay: "140ms" }}
          />
        </div>
        <span
          className="fb-logo-wordmark fake-brand-preview__el text-sm font-bold"
          style={{ fontFamily: "var(--brand-display-font)", color: "var(--brand-primary)" }}
        >
          {kit.name}
        </span>
      </div>
    );
  }

  return (
    <div className="fb-scene fb-scene--logo flex h-full flex-col items-center justify-center gap-3 p-5">
      <div className="flex flex-col gap-1.5">
        <div
          className="fb-logo-bar fake-brand-preview__el h-2 w-9 rounded-full"
          style={{ backgroundColor: "var(--brand-accent)", animationDelay: "0ms" }}
        />
        <div
          className="fb-logo-bar fake-brand-preview__el h-2 w-11 rounded-full"
          style={{ backgroundColor: "var(--brand-accent)", animationDelay: "80ms" }}
        />
        <div
          className="fb-logo-bar fake-brand-preview__el h-2 w-7 rounded-full"
          style={{ backgroundColor: "var(--brand-accent)", animationDelay: "160ms" }}
        />
      </div>
      <div className="fb-logo-wordmark-wrap overflow-hidden">
        <span
          className="fb-logo-wordmark fake-brand-preview__el block text-sm font-semibold tracking-tight"
          style={{ fontFamily: "var(--brand-heading-font)", color: "var(--brand-primary)" }}
        >
          {kit.name}
        </span>
      </div>
    </div>
  );
}

function HeroTextRevealScene({ kit }: SceneProps) {
  const slug = getBrandSlug(kit);
  const lines = kit.voiceTone.sample.slice(0, 2);

  if (slug === "ledgerly") {
    return (
      <div className="fb-scene fb-scene--hero flex h-full flex-col justify-end gap-3 p-4">
        <div className="space-y-1">
          <p
            className="fb-hero-line fake-brand-preview__el text-[11px] font-semibold leading-tight"
            style={{ fontFamily: "var(--brand-display-font)", color: "var(--brand-secondary)" }}
          >
            {lines[0]}
          </p>
          <div
            className="fb-hero-underline fake-brand-preview__el h-0.5 rounded-full"
            style={{ backgroundColor: "var(--brand-accent)" }}
          />
        </div>
        <div
          className="fb-hero-panel fake-brand-preview__el rounded-md border p-2"
          style={{
            backgroundColor: "color-mix(in srgb, var(--brand-surface) 92%, #000)",
            borderColor: "color-mix(in srgb, var(--brand-muted) 30%, transparent)",
          }}
        >
          <div className="mb-1.5 flex gap-1">
            {[40, 65, 50].map((w, i) => (
              <div
                key={w}
                className="fb-hero-metric fake-brand-preview__el h-1 rounded-full"
                style={{
                  width: `${w}%`,
                  backgroundColor: i === 1 ? "var(--brand-accent)" : "var(--brand-muted)",
                  opacity: i === 1 ? 1 : 0.35,
                  animationDelay: `${i * 100}ms`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (slug === "draftly") {
    return (
      <div className="fb-scene fb-scene--hero relative flex h-full flex-col justify-center gap-2 p-4">
        <p
          className="fb-hero-word fake-brand-preview__el text-[13px] font-bold leading-none"
          style={{ fontFamily: "var(--brand-display-font)", color: "var(--brand-primary)" }}
        >
          {lines[0].split(" ").slice(0, 3).join(" ")}
        </p>
        <p
          className="fb-hero-word fake-brand-preview__el text-[13px] font-bold leading-none"
          style={{
            fontFamily: "var(--brand-display-font)",
            color: "var(--brand-accent)",
            animationDelay: "120ms",
          }}
        >
          {lines[0].split(" ").slice(3).join(" ") || lines[1]?.split(" ").slice(0, 2).join(" ")}
        </p>
        <div
          className="fb-hero-card fake-brand-preview__el absolute bottom-3 right-3 rounded-md border px-2 py-1 text-[8px] shadow-sm"
          style={{
            backgroundColor: "var(--brand-surface)",
            borderColor: "var(--brand-accent)",
            color: "var(--brand-muted)",
          }}
        >
          + template
        </div>
      </div>
    );
  }

  return (
    <div className="fb-scene fb-scene--hero flex h-full flex-col justify-center gap-3 p-4">
      <div className="space-y-1">
        {lines.map((line, i) => (
          <div key={line} className="fb-hero-line-wrap overflow-hidden">
            <p
              className="fb-hero-line fake-brand-preview__el text-[11px] font-semibold leading-snug"
              style={{
                fontFamily: "var(--brand-heading-font)",
                color: "var(--brand-primary)",
                animationDelay: `${i * 100}ms`,
              }}
            >
              {line}
            </p>
          </div>
        ))}
      </div>
      <div
        className="fb-hero-panel fake-brand-preview__el rounded-lg border p-2 shadow-sm"
        style={{
          backgroundColor: "var(--brand-surface)",
          borderColor: "color-mix(in srgb, var(--brand-muted) 25%, transparent)",
        }}
      >
        <div className="mb-1.5 flex items-center gap-1">
          <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--brand-accent)" }} />
          <div className="h-1 w-10 rounded-full" style={{ backgroundColor: "var(--brand-muted)", opacity: 0.3 }} />
        </div>
        <div className="space-y-1">
          <div className="h-1 w-full rounded-full" style={{ backgroundColor: "var(--brand-secondary)" }} />
          <div className="h-1 w-4/5 rounded-full" style={{ backgroundColor: "var(--brand-secondary)" }} />
        </div>
      </div>
    </div>
  );
}

function ProductUiRevealScene({ kit }: SceneProps) {
  const slug = getBrandSlug(kit);

  if (slug === "ledgerly") {
    return (
      <div className="fb-scene fb-scene--product flex h-full items-stretch gap-2 p-3">
        <div
          className="fb-ui-sidebar fake-brand-preview__el w-8 shrink-0 rounded-md"
          style={{ backgroundColor: "color-mix(in srgb, var(--brand-surface) 80%, #000)" }}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div
            className="fb-ui-panel fake-brand-preview__el flex-1 rounded-md border p-2"
            style={{
              backgroundColor: "var(--brand-surface)",
              borderColor: "color-mix(in srgb, var(--brand-muted) 25%, transparent)",
            }}
          >
            <svg viewBox="0 0 120 48" className="h-full w-full" aria-hidden>
              <polyline
                className="fb-chart-line fake-brand-preview__el"
                fill="none"
                stroke="var(--brand-accent)"
                strokeWidth="2"
                strokeLinecap="round"
                points="0,40 20,32 40,36 60,18 80,22 100,8 120,12"
              />
              <polyline
                className="fb-chart-line fake-brand-preview__el"
                fill="none"
                stroke="var(--brand-muted)"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.4"
                points="0,44 30,38 60,34 90,30 120,28"
                style={{ animationDelay: "200ms" }}
              />
            </svg>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="fb-ui-stat fake-brand-preview__el h-5 rounded"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--brand-accent) 15%, var(--brand-surface))",
                  animationDelay: `${n * 80}ms`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (slug === "draftly") {
    return (
      <div className="fb-scene fb-scene--product relative flex h-full items-center justify-center p-3">
        <div
          className="fb-ui-card fake-brand-preview__el absolute left-3 top-3 w-[42%] rounded-lg border p-2 shadow-sm"
          style={{ backgroundColor: "var(--brand-surface)", borderColor: "var(--brand-secondary)" }}
        >
          <div className="mb-1 h-1 w-8 rounded-full" style={{ backgroundColor: "var(--brand-accent)" }} />
          <div className="h-1 w-full rounded-full" style={{ backgroundColor: "var(--brand-secondary)" }} />
        </div>
        <div
          className="fb-ui-card fake-brand-preview__el absolute bottom-4 right-3 w-[48%] rounded-lg border p-2 shadow-md"
          style={{
            backgroundColor: "var(--brand-surface)",
            borderColor: "var(--brand-accent)",
            animationDelay: "100ms",
          }}
        >
          <div className="h-1 w-full rounded-full" style={{ backgroundColor: "var(--brand-secondary)" }} />
        </div>
        <div
          className="fb-ui-comment fake-brand-preview__el absolute right-6 top-5 rounded-full px-2 py-0.5 text-[7px] font-medium"
          style={{ backgroundColor: "var(--brand-warm)", color: "#fff" }}
        >
          edit
        </div>
        <div className="fb-ui-cursor fake-brand-preview__el absolute h-2.5 w-2.5 rotate-[-20deg]">
          <svg viewBox="0 0 12 12" className="h-full w-full drop-shadow" aria-hidden>
            <path d="M1 1 L1 10 L4 7 L6 11 L7 10.5 L5 6.5 L9 6 Z" fill="var(--brand-primary)" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="fb-scene fb-scene--product flex h-full gap-2 p-3">
      <div
        className="fb-ui-sidebar fake-brand-preview__el w-7 shrink-0 rounded-md border"
        style={{
          backgroundColor: "var(--brand-surface)",
          borderColor: "color-mix(in srgb, var(--brand-muted) 20%, transparent)",
        }}
      >
        <div className="mx-auto mt-2 h-1.5 w-3 rounded-full" style={{ backgroundColor: "var(--brand-accent)" }} />
      </div>
      <div
        className="fb-ui-panel fake-brand-preview__el min-w-0 flex-1 rounded-lg border p-2.5 shadow-sm"
        style={{
          backgroundColor: "var(--brand-surface)",
          borderColor: "color-mix(in srgb, var(--brand-muted) 20%, transparent)",
        }}
      >
        <div className="mb-2 flex items-center gap-1.5 border-b pb-2" style={{ borderColor: "var(--brand-secondary)" }}>
          <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--brand-accent)" }} />
          <div className="h-1 flex-1 rounded-full" style={{ backgroundColor: "var(--brand-secondary)" }} />
        </div>
        <div className="space-y-1.5">
          {[100, 85, 70].map((w) => (
            <div
              key={w}
              className="fb-ui-row fake-brand-preview__el h-1 rounded-full"
              style={{ width: `${w}%`, backgroundColor: "var(--brand-secondary)" }}
            />
          ))}
        </div>
        <div
          className="fb-ui-callout fake-brand-preview__el mt-2 h-5 rounded border-l-2 pl-1.5 text-[7px] leading-5"
          style={{ borderColor: "var(--brand-accent)", color: "var(--brand-muted)" }}
        >
          Sprint board
        </div>
      </div>
    </div>
  );
}

function StatCardScene({ kit, reducedMotion }: SceneProps) {
  const slug = getBrandSlug(kit);
  const duration = kit.motionKit.timingScale.emphasis;
  const countTarget = slug === "ledgerly" ? 24 : slug === "draftly" ? 128 : 98;
  const count = useCountUp(countTarget, duration, reducedMotion);

  if (slug === "ledgerly") {
    return (
      <div className="fb-scene fb-scene--stat flex h-full flex-col justify-between p-4">
        <div>
          <p className="text-[8px] uppercase tracking-widest" style={{ color: "var(--brand-muted)" }}>
            Net revenue
          </p>
          <p
            className="fb-stat-value fake-brand-preview__el mt-0.5 text-2xl font-bold tabular-nums"
            style={{ fontFamily: "var(--brand-display-font)", color: "var(--brand-secondary)" }}
          >
            ${count / 10}.{count % 10}M
          </p>
          <p className="text-[8px]" style={{ color: "var(--brand-positive)" }}>
            +12.4% QoQ
          </p>
        </div>
        <svg viewBox="0 0 100 24" className="w-full" aria-hidden>
          <polyline
            className="fb-chart-line fake-brand-preview__el"
            fill="none"
            stroke="var(--brand-accent)"
            strokeWidth="2"
            strokeLinecap="round"
            points="0,20 25,16 50,18 75,8 100,4"
          />
        </svg>
      </div>
    );
  }

  if (slug === "draftly") {
    return (
      <div className="fb-scene fb-scene--stat flex h-full items-center justify-center p-4">
        <div
          className="fb-stat-card fake-brand-preview__el w-full rounded-xl border-2 p-3 text-center"
          style={{
            backgroundColor: "var(--brand-surface)",
            borderColor: "var(--brand-accent)",
          }}
        >
          <p
            className="fb-stat-value fake-brand-preview__el text-3xl font-bold tabular-nums"
            style={{ fontFamily: "var(--brand-display-font)", color: "var(--brand-accent)" }}
          >
            {count}
          </p>
          <p className="mt-0.5 text-[9px]" style={{ color: "var(--brand-muted)" }}>
            drafts shipped
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fb-scene fb-scene--stat flex h-full flex-col items-center justify-center p-4 text-center">
      <p
        className="fb-stat-value fake-brand-preview__el text-3xl font-semibold tabular-nums"
        style={{ fontFamily: "var(--brand-display-font)", color: "var(--brand-primary)" }}
      >
        {count}%
      </p>
      <p className="mt-1 text-[9px]" style={{ color: "var(--brand-muted)" }}>
        on-time delivery
      </p>
      <div
        className="fb-stat-bar fake-brand-preview__el mt-2 h-1 w-20 overflow-hidden rounded-full"
        style={{ backgroundColor: "var(--brand-secondary)" }}
      >
        <div
          className="h-full rounded-full"
          style={{ backgroundColor: "var(--brand-accent)", width: `${count}%` }}
        />
      </div>
    </div>
  );
}

function CtaEndCardScene({ kit }: SceneProps) {
  const slug = getBrandSlug(kit);

  if (slug === "ledgerly") {
    return (
      <div className="fb-scene fb-scene--cta flex h-full flex-col items-center justify-center gap-3 p-5">
        <span
          className="fb-cta-logo fake-brand-preview__el text-xs font-bold tracking-wide"
          style={{ fontFamily: "var(--brand-display-font)", color: "var(--brand-secondary)" }}
        >
          {kit.name}
        </span>
        <button
          type="button"
          className="fb-cta-button fake-brand-preview__el rounded px-4 py-1.5 text-[9px] font-semibold"
          style={{
            backgroundColor: "var(--brand-accent)",
            color: "var(--brand-surface)",
            boxShadow: "0 4px 20px color-mix(in srgb, var(--brand-accent) 40%, transparent)",
          }}
        >
          Request demo
        </button>
      </div>
    );
  }

  if (slug === "draftly") {
    return (
      <div className="fb-scene fb-scene--cta relative flex h-full flex-col items-center justify-center gap-2 p-5">
        <div
          className="fb-cta-sticker fake-brand-preview__el absolute left-4 top-4 rounded-md px-1.5 py-0.5 text-[7px] font-bold"
          style={{ backgroundColor: "var(--brand-pop)", color: "var(--brand-primary)" }}
        >
          new
        </div>
        <span
          className="fb-cta-logo fake-brand-preview__el text-sm font-bold"
          style={{ fontFamily: "var(--brand-display-font)", color: "var(--brand-primary)" }}
        >
          {kit.name}
        </span>
        <button
          type="button"
          className="fb-cta-button fake-brand-preview__el rounded-full px-4 py-1.5 text-[9px] font-semibold text-white"
          style={{ backgroundColor: "var(--brand-accent)" }}
        >
          Start creating
        </button>
      </div>
    );
  }

  return (
    <div className="fb-scene fb-scene--cta flex h-full flex-col items-center justify-center gap-2.5 p-5">
      <div
        className="fb-cta-logo fake-brand-preview__el flex h-7 w-7 items-center justify-center rounded-lg"
        style={{ backgroundColor: "var(--brand-accent)" }}
      >
        <span className="text-[10px] font-bold text-white">{kit.name.charAt(0)}</span>
      </div>
      <span
        className="text-xs font-semibold"
        style={{ fontFamily: "var(--brand-heading-font)", color: "var(--brand-primary)" }}
      >
        {kit.name}
      </span>
      <button
        type="button"
        className="fb-cta-button fake-brand-preview__el rounded-md px-3.5 py-1 text-[9px] font-medium text-white"
        style={{ backgroundColor: "var(--brand-accent)" }}
      >
        Get started
      </button>
    </div>
  );
}

function FeatureCalloutScene({ kit }: SceneProps) {
  return (
    <div className="fb-scene flex h-full flex-col justify-center gap-2 p-4">
      <span className="fb-callout-label fake-brand-preview__el text-[10px] font-medium" style={{ color: "var(--brand-accent)" }}>
        Feature
      </span>
      <div className="fb-callout-line fake-brand-preview__el h-px w-full" style={{ backgroundColor: "var(--brand-accent)" }} />
      <p className="text-[9px] leading-snug" style={{ color: "var(--brand-muted)" }}>
        {kit.motionKit.blockDefaults.featureCallout ?? "Callout copy"}
      </p>
    </div>
  );
}

function QuoteCardScene({ kit }: SceneProps) {
  return (
    <div className="fb-scene flex h-full items-center p-4">
      <p
        className="fb-quote-text fake-brand-preview__el text-[10px] italic leading-snug"
        style={{ fontFamily: "var(--brand-heading-font)", color: "var(--brand-primary)" }}
      >
        &ldquo;{kit.voiceTone.sample[1] ?? kit.voiceTone.sample[0]}&rdquo;
      </p>
    </div>
  );
}

function SocialAdScene({ kit }: SceneProps) {
  return (
    <div className="fb-scene flex h-full items-center justify-center p-3">
      <div
        className="fb-social-frame fake-brand-preview__el aspect-[4/5] w-3/5 rounded-lg border-2 p-2"
        style={{ backgroundColor: "var(--brand-surface)", borderColor: "var(--brand-accent)" }}
      >
        <div className="mb-2 h-2 w-2 rounded-full" style={{ backgroundColor: "var(--brand-accent)" }} />
        <p className="text-[8px] font-semibold" style={{ fontFamily: "var(--brand-heading-font)", color: "var(--brand-primary)" }}>
          {kit.name}
        </p>
      </div>
    </div>
  );
}

export function PreviewScene({
  kit,
  variant,
  reducedMotion,
}: SceneProps & { variant: MotionPreviewVariant }) {
  switch (variant) {
    case "logoReveal":
      return <LogoRevealScene kit={kit} reducedMotion={reducedMotion} />;
    case "websiteHero":
      return <HeroTextRevealScene kit={kit} reducedMotion={reducedMotion} />;
    case "productUiReveal":
      return <ProductUiRevealScene kit={kit} reducedMotion={reducedMotion} />;
    case "statCard":
      return <StatCardScene kit={kit} reducedMotion={reducedMotion} />;
    case "ctaEndCard":
      return <CtaEndCardScene kit={kit} reducedMotion={reducedMotion} />;
    case "featureCallout":
      return <FeatureCalloutScene kit={kit} reducedMotion={reducedMotion} />;
    case "quoteCard":
      return <QuoteCardScene kit={kit} reducedMotion={reducedMotion} />;
    case "socialAd":
      return <SocialAdScene kit={kit} reducedMotion={reducedMotion} />;
    default:
      return null;
  }
}

export const FEATURED_PREVIEW_VARIANTS = [
  "logoReveal",
  "websiteHero",
  "productUiReveal",
  "statCard",
  "ctaEndCard",
] as const satisfies readonly MotionPreviewVariant[];

export const FEATURED_PREVIEW_LABELS: Record<(typeof FEATURED_PREVIEW_VARIANTS)[number], string> = {
  logoReveal: "Logo Reveal",
  websiteHero: "Hero Text Reveal",
  productUiReveal: "Product UI Reveal",
  statCard: "Stat Card",
  ctaEndCard: "CTA End Card",
};
