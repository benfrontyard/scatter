import type { ReactNode } from "react";
import type { BrandMotionKit } from "@/data/fakeBrands/types";
import { cn } from "@/lib/utils";

type SectionProps = {
  id: string;
  title: string;
  children: ReactNode;
  className?: string;
};

function Section({ id, title, children, className }: SectionProps) {
  return (
    <section id={id} className={cn("scroll-mt-4 space-y-3", className)}>
      <h3 className="text-sm font-semibold">{title}</h3>
      {children}
    </section>
  );
}

function TagList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-1">
      {items.map((item) => (
        <li
          key={item}
          className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1 text-xs text-muted-foreground">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="text-muted-foreground/50">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function KeyValueGrid({ entries }: { entries: [string, string | number][] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-3">
      {entries.map(([key, value]) => (
        <div key={key}>
          <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">{key}</dt>
          <dd className="font-mono text-[11px]">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

type BrandKitDetailPanelProps = {
  kit: BrandMotionKit;
};

export function BrandKitDetailPanel({ kit }: BrandKitDetailPanelProps) {
  const { identity, motionKit } = kit;
  const colorEntries = Object.entries(identity.colors);

  return (
    <div className="space-y-8">
      <Section id="overview" title="Brand overview">
        <p className="text-sm text-muted-foreground">{kit.description}</p>
        <dl className="grid gap-3 text-xs sm:grid-cols-2">
          <div>
            <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Category</dt>
            <dd>{kit.category}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Audience</dt>
            <dd className="text-muted-foreground">{kit.audience}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">Positioning</dt>
            <dd className="text-muted-foreground">{kit.positioning}</dd>
          </div>
        </dl>
      </Section>

      <Section id="personality" title="Personality & voice">
        <TagList items={kit.personality} />
        <div className="space-y-2">
          <h4 className="text-xs font-medium">Voice principles</h4>
          <BulletList items={kit.voiceTone.principles} />
        </div>
        <div className="space-y-2">
          <h4 className="text-xs font-medium">Sample copy</h4>
          <BulletList items={kit.voiceTone.sample} />
        </div>
      </Section>

      <Section id="identity" title="Logo & identity">
        <p className="text-xs text-muted-foreground">{identity.logoConcept}</p>
        <div className="rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center">
          <div
            className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold"
            style={{
              backgroundColor: identity.colors.accent?.hex,
              color: identity.colors.surface?.hex ?? "#fff",
              fontFamily: `"${identity.typography.display.family}", ${identity.typography.display.fallback}`,
            }}
          >
            {kit.name.charAt(0)}
          </div>
          <p className="text-[10px] text-muted-foreground">Logo concept placeholder</p>
        </div>
        <div className="space-y-2">
          <h4 className="text-xs font-medium">Variants</h4>
          <TagList items={identity.logoVariants} />
        </div>
        <div className="space-y-2">
          <h4 className="text-xs font-medium">Usage rules</h4>
          <BulletList items={identity.logoUsageRules} />
        </div>
      </Section>

      <Section id="colors" title="Colors">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {colorEntries.map(([key, color]) => (
            <div key={key} className="overflow-hidden rounded-lg border border-border">
              <div className="h-12" style={{ backgroundColor: color.hex }} />
              <div className="space-y-0.5 p-2">
                <p className="text-[11px] font-medium">{color.name}</p>
                <p className="font-mono text-[10px] text-muted-foreground">{color.hex}</p>
                <p className="text-[9px] text-muted-foreground">{color.role}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="typography" title="Typography system">
        <dl className="grid gap-3 text-xs sm:grid-cols-2">
          {(["display", "heading", "body", "mono"] as const).map((role) => {
            const font = identity.typography[role];
            return (
              <div key={role} className="rounded-lg border border-border p-3">
                <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">{role}</dt>
                <dd
                  className="mt-1 text-base font-semibold"
                  style={{ fontFamily: `"${font.family}", ${font.fallback}`, fontWeight: font.weight }}
                >
                  {font.family}
                </dd>
                <dd className="text-[10px] text-muted-foreground">Weight {font.weight}</dd>
              </div>
            );
          })}
        </dl>
      </Section>

      <Section id="type-scale" title="Type scale">
        <div className="space-y-2">
          {Object.entries(identity.typography.scale).map(([token, scale]) => (
            <div
              key={token}
              className="flex items-baseline justify-between gap-4 rounded border border-border px-3 py-2"
            >
              <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {token}
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">
                {scale.size}px / lh {scale.lineHeight} / trk {scale.tracking}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section id="layout" title="Icon, layout & imagery">
        <KeyValueGrid
          entries={[
            ["Icon style", identity.iconStyle.style],
            ["Stroke", identity.iconStyle.strokeWidth],
            ["Corners", identity.iconStyle.cornerRadius],
            ["Grid", identity.layoutGrid.system],
          ]}
        />
        <div className="space-y-2">
          <h4 className="text-xs font-medium">Icon rules</h4>
          <BulletList items={identity.iconStyle.rules} />
        </div>
        <div className="space-y-2">
          <h4 className="text-xs font-medium">Layout rules</h4>
          <BulletList items={identity.layoutGrid.rules} />
        </div>
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Imagery:</span> {identity.imageryStyle}
        </p>
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">UI style:</span> {identity.uiStyle}
        </p>
      </Section>

      <Section id="rules" title="Do / don't">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h4 className="mb-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">Do</h4>
            <BulletList items={identity.doDontRules.do} />
          </div>
          <div>
            <h4 className="mb-2 text-xs font-medium text-red-500">Don&apos;t</h4>
            <BulletList items={identity.doDontRules.dont} />
          </div>
        </div>
      </Section>

      <Section id="motion" title="Motion DNA">
        <p className="text-sm font-medium">{motionKit.motionPersonality}</p>
        <p className="text-xs text-muted-foreground">{motionKit.logoAnimation}</p>
      </Section>

      <Section id="easing" title="Easing & timing">
        <KeyValueGrid
          entries={[
            ["Default", motionKit.easing.default],
            ["Exit", motionKit.easing.exit],
            ["Emphasis", motionKit.easing.emphasis],
            ["Micro", `${motionKit.timingScale.micro}ms`],
            ["Standard", `${motionKit.timingScale.standard}ms`],
            ["Emphasis", `${motionKit.timingScale.emphasis}ms`],
            ["Hero", `${motionKit.timingScale.hero}ms`],
          ]}
        />
        <p className="text-[10px] text-muted-foreground">{motionKit.easing.notes}</p>
      </Section>

      <Section id="reveals" title="Text reveal & transitions">
        <KeyValueGrid
          entries={[
            ["Text reveal", motionKit.textReveal.default],
            ["Transition", motionKit.transitions.primary],
          ]}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <h4 className="mb-1 text-xs font-medium">Secondary reveals</h4>
            <TagList items={motionKit.textReveal.secondary} />
          </div>
          <div>
            <h4 className="mb-1 text-xs font-medium">Secondary transitions</h4>
            <TagList items={motionKit.transitions.secondary} />
          </div>
        </div>
      </Section>

      <Section id="camera" title="Camera defaults">
        <KeyValueGrid
          entries={[
            ["Style", motionKit.camera.style],
            ["Zoom", motionKit.camera.zoomAmount],
            ["Perspective", motionKit.camera.perspective],
            ["Parallax", motionKit.camera.parallaxDepth],
            ["Rotation", `${motionKit.camera.rotation}°`],
            ["Focus blur", motionKit.camera.focusBlur],
          ]}
        />
      </Section>

      <Section id="effects" title="Effects defaults">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {Object.entries(motionKit.effects).map(([name, effect]) => (
            <div key={name} className="rounded border border-border px-2 py-1.5 text-xs">
              <span className="font-medium capitalize">{name}</span>
              <span className="ml-1 text-muted-foreground">
                {effect.enabled ? `on · ${effect.intensity}` : "off"}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section id="export" title="Export defaults">
        <KeyValueGrid
          entries={[
            ["Aspect ratios", motionKit.exportDefaults.aspectRatios.join(", ")],
            ["Duration", `${motionKit.exportDefaults.defaultDurationSeconds}s`],
            ["Preview quality", motionKit.exportDefaults.previewQuality],
            ["Export quality", motionKit.exportDefaults.exportQuality],
          ]}
        />
        <div className="space-y-1">
          <h4 className="text-xs font-medium">Block defaults</h4>
          <dl className="space-y-1 text-xs">
            {Object.entries(motionKit.blockDefaults).map(([block, desc]) => (
              <div key={block} className="flex gap-2">
                <dt className="shrink-0 font-medium capitalize">{block}:</dt>
                <dd className="text-muted-foreground">{desc}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>
    </div>
  );
}
