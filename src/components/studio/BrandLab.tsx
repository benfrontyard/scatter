import { useMemo, useState } from "react";
import { fakeBrandKits } from "@/data/fakeBrands";
import { BrandKitDetailPanel } from "@/components/studio/fake-brands/BrandKitDetailPanel";
import { BrandAssetsPanel } from "@/components/studio/fake-brands/BrandAssetsPanel";
import { MotionPreviewCard } from "@/components/studio/fake-brands/MotionPreviewCard";
import {
  FEATURED_PREVIEW_LABELS,
  FEATURED_PREVIEW_VARIANTS,
} from "@/components/studio/fake-brands/PreviewScenes";
import { TemplatePresetCard } from "@/components/studio/fake-brands/TemplatePresetCard";
import { brandThemeStyle, getBrandTheme, previewVariantFromTemplate } from "@/components/studio/fake-brands/brand-theme";
import { cn } from "@/lib/utils";
import { Palette, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const SECTIONS = [
  { id: "motion-lab", label: "Motion lab" },
  { id: "overview", label: "Overview" },
  { id: "personality", label: "Personality" },
  { id: "identity", label: "Logo" },
  { id: "colors", label: "Colors" },
  { id: "typography", label: "Typography" },
  { id: "assets", label: "Assets" },
  { id: "type-scale", label: "Type scale" },
  { id: "layout", label: "Layout" },
  { id: "rules", label: "Do / don't" },
  { id: "motion", label: "Motion DNA" },
  { id: "easing", label: "Easing" },
  { id: "reveals", label: "Reveals" },
  { id: "camera", label: "Camera" },
  { id: "effects", label: "Effects" },
  { id: "export", label: "Export" },
  { id: "templates", label: "Templates" },
] as const;

export function BrandLab() {
  const [selectedName, setSelectedName] = useState(fakeBrandKits[0].name);

  const kit = useMemo(
    () => fakeBrandKits.find((b) => b.name === selectedName) ?? fakeBrandKits[0],
    [selectedName],
  );

  const theme = useMemo(() => getBrandTheme(kit), [kit]);
  const secondaryTemplates = kit.templates.filter((t) => {
    const variant = previewVariantFromTemplate(t.id, t.name);
    return !FEATURED_PREVIEW_VARIANTS.includes(variant as (typeof FEATURED_PREVIEW_VARIANTS)[number]);
  });

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="flex h-full min-h-0 bg-background">
      <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-card/40">
        <div className="border-b border-border px-4 py-3">
          <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold">
            <Palette className="h-3.5 w-3.5" />
            Brand Lab
          </div>
          <p className="text-[10px] leading-snug text-muted-foreground">
            Demo brand motion kits for cross-brand block testing
          </p>
        </div>

        <nav className="border-b border-border p-2" aria-label="Brand switcher">
          <ul className="space-y-1">
            {fakeBrandKits.map((brand) => {
              const brandTheme = getBrandTheme(brand);
              const selected = selectedName === brand.name;
              return (
                <li key={brand.name}>
                  <button
                    type="button"
                    onClick={() => setSelectedName(brand.name)}
                    className={cn(
                      "relative w-full rounded-lg px-3 py-2.5 text-left transition-colors",
                      selected
                        ? "bg-secondary shadow-sm ring-1 ring-border"
                        : "hover:bg-secondary/60",
                    )}
                  >
                    {selected ? (
                      <span
                        className="absolute bottom-2 left-0 top-2 w-0.5 rounded-full"
                        style={{ backgroundColor: brandTheme.accent }}
                      />
                    ) : null}
                    <div className="flex items-center gap-2 pl-1">
                      <span className="flex gap-0.5">
                        {[brandTheme.accent, brandTheme.background, brandTheme.primary].map((c) => (
                          <span
                            key={c}
                            className="h-2.5 w-2.5 rounded-full ring-1 ring-black/10"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </span>
                      <span className={cn("text-xs font-semibold", selected && "text-foreground")}>
                        {brand.name}
                      </span>
                    </div>
                    <p className="mt-0.5 pl-1 text-[10px] text-muted-foreground">
                      {brand.motionKit.motionPersonality}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <nav className="min-h-0 flex-1 overflow-y-auto p-2" aria-label="Section navigation">
          <p className="mb-1.5 px-2 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
            Jump to
          </p>
          <ul className="space-y-0.5">
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <button
                  type="button"
                  onClick={() => scrollTo(section.id)}
                  className="w-full rounded-md px-2 py-1.5 text-left text-[11px] text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground"
                >
                  {section.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <header
          className="sticky top-0 z-10 border-b border-border px-6 py-4 backdrop-blur-md"
          style={{
            ...brandThemeStyle(kit),
            backgroundColor: "color-mix(in srgb, var(--background) 92%, var(--brand-background))",
          }}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  Demo motion kit
                </span>
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{
                    backgroundColor: `color-mix(in srgb, ${theme.accent} 14%, transparent)`,
                    color: theme.accent,
                  }}
                >
                  <Sparkles className="h-3 w-3" />
                  {kit.motionKit.motionPersonality}
                </span>
              </div>
              <h2
                className="text-2xl font-semibold tracking-tight"
                style={{
                  fontFamily: theme.displayFont,
                  color: theme.primary,
                }}
              >
                {kit.name}
              </h2>
              <p className="max-w-xl text-sm text-muted-foreground">{kit.description}</p>
              <div className="flex flex-wrap gap-3 pt-1 font-mono text-[10px] text-muted-foreground">
                <span>ease {kit.motionKit.easing.default.replace("cubic-bezier(", "").replace(")", "")}</span>
                <span>·</span>
                <span>std {kit.motionKit.timingScale.standard}ms</span>
                <span>·</span>
                <span>hero {kit.motionKit.timingScale.hero}ms</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              disabled
              title="Coming soon — use Brand Lab to inspect motion DNA for block testing."
            >
              Apply kit to project
            </Button>
          </div>
        </header>

        <div className="space-y-10 px-6 py-8">
          <section id="motion-lab" className="scroll-mt-4">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold">Motion lab</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Preview motion DNA — the same kits are available in Block Workbench testing.
                </p>
              </div>
              <div className="hidden items-center gap-1 sm:flex">
                {[theme.accent, theme.background, theme.surface, theme.primary, theme.secondary].map((c) => (
                  <span
                    key={c}
                    className="h-5 w-5 rounded-md ring-1 ring-border"
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
              {FEATURED_PREVIEW_VARIANTS.map((variant) => (
                <MotionPreviewCard
                  key={variant}
                  kit={kit}
                  variant={variant}
                  label={FEATURED_PREVIEW_LABELS[variant]}
                  featured
                />
              ))}
            </div>

            {secondaryTemplates.length > 0 ? (
              <div className="mt-6">
                <h4 className="mb-3 text-xs font-medium text-muted-foreground">Additional templates</h4>
                <div className="grid gap-3 sm:grid-cols-3">
                  {secondaryTemplates.map((template) => (
                    <MotionPreviewCard
                      key={template.id}
                      kit={kit}
                      variant={previewVariantFromTemplate(template.id, template.name)}
                      label={template.name}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </section>

          <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
            <div className="space-y-10">
              <BrandKitDetailPanel kit={kit} />
              <BrandAssetsPanel kit={kit} />
            </div>

            <section id="templates" className="scroll-mt-4 space-y-3 lg:sticky lg:top-28 lg:self-start">
              <h3 className="text-sm font-semibold">Template presets</h3>
              <p className="text-[10px] text-muted-foreground">
                Reference presets for block testing — apply actions are not wired yet.
              </p>
              <div className="space-y-2">
                {kit.templates.map((preset) => (
                  <TemplatePresetCard key={preset.id} kit={kit} preset={preset} />
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

/** @deprecated Use BrandLab */
export const FakeBrandsStudio = BrandLab;
