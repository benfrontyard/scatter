import type { BrandMotionKit } from "@/data/fakeBrands/types";
import {
  brandIdFromName,
  fakeBrandAssetRules,
  getAssetQueriesForBrand,
  getFontLibraryForBrand,
  getIconLibraryForBrand,
  getPlaceholderAssetsForBrand,
  recommendedStockLibraries,
} from "@/data/fakeBrands/assetSources";
import { cn } from "@/lib/utils";
import { ExternalLink, ImageIcon, ShieldAlert } from "lucide-react";

type BrandAssetsPanelProps = {
  kit: BrandMotionKit;
};

function ExternalLinkRow({
  label,
  href,
  sublabel,
}: {
  label: string;
  href: string;
  sublabel?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start justify-between gap-2 rounded-md border border-border px-3 py-2 text-xs transition-colors hover:bg-secondary/50"
    >
      <span>
        <span className="font-medium group-hover:underline">{label}</span>
        {sublabel ? <span className="mt-0.5 block text-[10px] text-muted-foreground">{sublabel}</span> : null}
      </span>
      <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
    </a>
  );
}

function RuleBlock({ title, items, tone }: { title: string; items: string[]; tone?: "warn" }) {
  return (
    <div className="space-y-2">
      <h4
        className={cn(
          "flex items-center gap-1.5 text-xs font-medium",
          tone === "warn" && "text-amber-600 dark:text-amber-400",
        )}
      >
        {tone === "warn" ? <ShieldAlert className="h-3.5 w-3.5" /> : null}
        {title}
      </h4>
      <ul className="space-y-1 text-xs text-muted-foreground">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="text-muted-foreground/50">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PlaceholderAssetCard({
  asset,
}: {
  asset: ReturnType<typeof getPlaceholderAssetsForBrand>[number];
}) {
  const isImported = Boolean(asset.localPath);

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-dashed border-border bg-muted/20">
      <div className="flex aspect-[4/3] items-center justify-center bg-muted/40">
        <div className="text-center">
          <ImageIcon className="mx-auto h-6 w-6 text-muted-foreground/50" />
          <p className="mt-1 text-[9px] uppercase tracking-wide text-muted-foreground">
            {isImported ? "Imported" : "Placeholder"}
          </p>
        </div>
      </div>
      <div className="space-y-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[11px] font-medium capitalize">{asset.assetType}</p>
          <span className="rounded bg-secondary px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
            {asset.sourceName}
          </span>
        </div>
        {asset.searchQuery ? (
          <p className="text-[10px] text-muted-foreground">
            Query: <span className="font-medium text-foreground">{asset.searchQuery}</span>
          </p>
        ) : null}
        {asset.usageNotes ? (
          <p className="text-[10px] leading-snug text-muted-foreground">{asset.usageNotes}</p>
        ) : null}
        <dl className="space-y-1 border-t border-border pt-2 text-[9px]">
          <div className="flex justify-between gap-2">
            <dt className="text-muted-foreground">License</dt>
            <dd>
              <a
                href={asset.licenseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:underline"
              >
                {asset.licenseName}
              </a>
            </dd>
          </div>
          {asset.authorName ? (
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Author</dt>
              <dd>{asset.authorName}</dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-2">
            <dt className="shrink-0 text-muted-foreground">Source</dt>
            <dd className="truncate text-right">
              <a
                href={asset.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:underline"
              >
                {asset.sourceUrl.replace(/^https?:\/\//, "").slice(0, 32)}
                …
              </a>
            </dd>
          </div>
          {asset.localPath ? (
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">Local</dt>
              <dd className="truncate font-mono">{asset.localPath}</dd>
            </div>
          ) : null}
        </dl>
        {asset.restrictedUses.length > 0 ? (
          <ul className="flex flex-wrap gap-1">
            {asset.restrictedUses.map((use) => (
              <li
                key={use}
                className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[8px] font-medium text-amber-700 dark:text-amber-300"
              >
                no {use}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}

export function BrandAssetsPanel({ kit }: BrandAssetsPanelProps) {
  const brandId = brandIdFromName(kit.name);
  const iconLibrary = getIconLibraryForBrand(brandId);
  const fontLibrary = getFontLibraryForBrand(brandId);
  const searchQueries = getAssetQueriesForBrand(brandId);
  const placeholders = getPlaceholderAssetsForBrand(brandId);

  return (
    <section id="assets" className="scroll-mt-4 space-y-8">
      <div>
        <h3 className="text-sm font-semibold">Assets</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Source libraries, search queries, and provenance metadata for legally safer placeholder content.
          Nothing is downloaded automatically — import via a future script.
        </p>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-medium">Icon library</h4>
        <ExternalLinkRow
          label={iconLibrary.primary.name}
          href={iconLibrary.primary.url}
          sublabel={`${iconLibrary.primary.licenseName}${iconLibrary.primary.notes ? ` · ${iconLibrary.primary.notes}` : ""}`}
        />
        {iconLibrary.fallback ? (
          <ExternalLinkRow
            label={`Fallback: ${iconLibrary.fallback.name}`}
            href={iconLibrary.fallback.url}
            sublabel={iconLibrary.fallback.licenseName}
          />
        ) : null}
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-medium">Font stack</h4>
        <div className="grid gap-2 sm:grid-cols-2">
          {fontLibrary.stack.map((font) => (
            <div key={font.role} className="rounded-lg border border-border p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{font.role}</p>
              <p
                className="mt-1 text-sm font-semibold"
                style={{ fontFamily: `"${font.family}", system-ui, sans-serif` }}
              >
                {font.family}
                {font.alternatives?.length ? (
                  <span className="ml-1 text-[10px] font-normal text-muted-foreground">
                    or {font.alternatives.join(", ")}
                  </span>
                ) : null}
              </p>
              <a
                href={font.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-[10px] text-muted-foreground hover:text-foreground hover:underline"
              >
                {font.sourceName} · {font.licenseName}
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-medium">Stock sources</h4>
        <div className="grid gap-2 sm:grid-cols-2">
          {recommendedStockLibraries.map((library) => (
            <ExternalLinkRow
              key={library.name}
              label={library.name}
              href={library.url}
              sublabel={`${library.licenseName} · ${library.assetTypes.join(", ")}${library.notes ? ` · ${library.notes}` : ""}`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-medium">Recommended search queries</h4>
        <ul className="flex flex-wrap gap-1">
          {searchQueries.map((query) => (
            <li
              key={query}
              className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground"
            >
              {query}
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-4 rounded-lg border border-border bg-card/40 p-4">
        <h4 className="text-xs font-medium">Asset usage rules</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <RuleBlock title="Metadata & workflow" items={fakeBrandAssetRules.global} />
          <RuleBlock title="Restricted uses" items={fakeBrandAssetRules.restrictedUses} tone="warn" />
          <RuleBlock title="Preferred imagery" items={fakeBrandAssetRules.preferredImagery} />
          <RuleBlock title="People imagery" items={fakeBrandAssetRules.peopleImagery} />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h4 className="text-xs font-medium">Placeholder assets</h4>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              Metadata-only cards — replace with imported files and localPath when ready.
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {placeholders.length} queued
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {placeholders.map((asset) => (
            <PlaceholderAssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      </div>
    </section>
  );
}
