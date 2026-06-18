import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LOGO_BACKGROUND_LABELS,
  LOGO_PREFERRED_USE_LABELS,
  LOGO_TYPE_OPTIONS,
  LOGO_VARIANT_ROLE_LABELS,
} from "@/config/logo/type-traits";
import {
  loadImageDimensions,
  registerLogoAsset,
  removeLogoAsset,
  updateLogoAsset,
} from "@/lib/brand-logo";
import { cn } from "@/lib/utils";
import type {
  BrandLogoSystem,
  BrandPreset,
  LogoAsset,
  LogoAssetType,
  LogoBackgroundCompatibility,
  LogoPreferredUse,
  LogoVariantRole,
  ProjectAsset,
} from "@/types";
import { ImagePlus, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

const PREFERRED_USE_OPTIONS = Object.entries(LOGO_PREFERRED_USE_LABELS) as Array<
  [LogoPreferredUse, string]
>;

const BACKGROUND_OPTIONS = Object.entries(LOGO_BACKGROUND_LABELS) as Array<
  [LogoBackgroundCompatibility, string]
>;

const VARIANT_OPTIONS = Object.entries(LOGO_VARIANT_ROLE_LABELS) as Array<
  [LogoVariantRole, string]
>;

type BrandLogosPanelProps = {
  brand: BrandPreset;
  assets: ProjectAsset[];
  onBrandChange: (brand: BrandPreset) => void;
  onUploadAsset: (file: File) => Promise<ProjectAsset | null>;
  embedded?: boolean;
};

export function BrandLogosPanel({
  brand,
  assets,
  onBrandChange,
  onUploadAsset,
  embedded = false,
}: BrandLogosPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(
    brand.logos.assets[0]?.id ?? null,
  );
  const [uploading, setUploading] = useState(false);

  const logos = brand.logos;
  const selected = logos.assets.find((a) => a.id === selectedId) ?? logos.assets[0];

  const updateLogos = (next: BrandLogoSystem) => {
    onBrandChange({ ...brand, logos: next });
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const projectAsset = await onUploadAsset(file);
      if (!projectAsset) return;

      let width: number | undefined;
      let height: number | undefined;
      try {
        const dims = await loadImageDimensions(projectAsset.dataUrl);
        width = dims.width;
        height = dims.height;
      } catch {
        // dimensions optional
      }

      const next = registerLogoAsset(logos, {
        assetId: projectAsset.id,
        name: file.name.replace(/\.[^.]+$/, ""),
        fileName: file.name,
        width,
        height,
      });

      updateLogos(next);
      const added = next.assets[next.assets.length - 1];
      if (added) setSelectedId(added.id);
    } finally {
      setUploading(false);
    }
  };

  const patchSelected = (patch: Partial<LogoAsset>) => {
    if (!selected) return;
    updateLogos(updateLogoAsset(logos, selected.id, patch));
  };

  const togglePreferredUse = (use: LogoPreferredUse, checked: boolean) => {
    if (!selected) return;
    const next = checked
      ? [...new Set([...selected.preferredUse, use])]
      : selected.preferredUse.filter((u) => u !== use);
    patchSelected({ preferredUse: next });
  };

  const toggleBackgroundCompat = (bg: LogoBackgroundCompatibility, checked: boolean) => {
    if (!selected) return;
    const next = checked
      ? [...new Set([...selected.backgroundCompatibility, bg])]
      : selected.backgroundCompatibility.filter((b) => b !== bg);
    patchSelected({ backgroundCompatibility: next });
  };

  const assetPreviewUrl = (asset?: LogoAsset) => {
    if (!asset?.assetId) return undefined;
    return assets.find((a) => a.id === asset.assetId)?.dataUrl;
  };

  return (
    <div className={cn("space-y-4", !embedded && "rounded-lg border border-border p-4")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Logo kit</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Upload multiple variants. The system picks the best lockup per format and block.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*,.svg"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleUpload(file);
              event.target.value = "";
            }}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 gap-1.5 text-xs"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            <ImagePlus className="h-3.5 w-3.5" />
            {uploading ? "Uploading…" : "Add logo"}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-background/50 p-3">
        <div className="space-y-1">
          <Label className="text-xs">Primary logo type</Label>
          <Select
            value={logos.primaryType}
            onValueChange={(value) =>
              updateLogos({ ...logos, primaryType: value as LogoAssetType })
            }
          >
            <SelectTrigger className="h-8 w-[200px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LOGO_TYPE_OPTIONS.map((opt) => (
                <SelectItem key={opt.id} value={opt.id} className="text-xs">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-xs">
          <input
            type="checkbox"
            className="h-3.5 w-3.5 rounded border border-input"
            checked={logos.preferSymbolInVertical}
            onChange={(e) =>
              updateLogos({ ...logos, preferSymbolInVertical: e.target.checked })
            }
          />
          Prefer symbol in vertical formats
        </label>
      </div>

      {logos.assets.length === 0 ? (
        <div className="rounded-md border border-dashed border-border px-4 py-10 text-center">
          <p className="text-sm text-muted-foreground">No logo variants yet.</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add horizontal, stacked, symbol-only, and one-color versions for responsive layouts.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
          <ul className="space-y-1.5">
            {logos.assets.map((asset) => {
              const preview = assetPreviewUrl(asset);
              const isActive = selected?.id === asset.id;
              return (
                <li key={asset.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(asset.id)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md border px-2 py-2 text-left transition-colors",
                      isActive
                        ? "border-primary/40 bg-primary/5"
                        : "border-border hover:bg-secondary/50",
                    )}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded bg-secondary/60">
                      {preview ? (
                        <img
                          src={preview}
                          alt=""
                          className="max-h-full max-w-full object-contain p-0.5"
                        />
                      ) : (
                        <span className="text-[9px] font-medium uppercase text-muted-foreground">
                          TXT
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{asset.name}</p>
                      <p className="truncate text-[10px] text-muted-foreground">
                        {LOGO_TYPE_OPTIONS.find((o) => o.id === asset.type)?.label} ·{" "}
                        {LOGO_VARIANT_ROLE_LABELS[asset.variantRole]}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>

          {selected ? (
            <div className="space-y-4 rounded-md border border-border p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-16 w-24 items-center justify-center overflow-hidden rounded-md border border-border bg-secondary/30">
                    {assetPreviewUrl(selected) ? (
                      <img
                        src={assetPreviewUrl(selected)}
                        alt=""
                        className="max-h-full max-w-full object-contain p-1"
                      />
                    ) : (
                      <span className="px-2 text-center text-[10px] text-muted-foreground">
                        {selected.textFallback ?? "Text logo"}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{selected.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      Aspect {selected.aspectRatio.toFixed(2)} · Optical{" "}
                      {selected.opticalWeight.toFixed(2)}×
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-destructive hover:text-destructive"
                  onClick={() => {
                    updateLogos(removeLogoAsset(logos, selected.id));
                    setSelectedId(logos.assets.find((a) => a.id !== selected.id)?.id ?? null);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Name</Label>
                  <Input
                    value={selected.name}
                    className="h-8 text-xs"
                    onChange={(e) => patchSelected({ name: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Logo type</Label>
                  <Select
                    value={selected.type}
                    onValueChange={(value) =>
                      patchSelected({
                        type: value as LogoAssetType,
                        classificationLocked: true,
                      })
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LOGO_TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.id} value={opt.id} className="text-xs">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Variant</Label>
                  <Select
                    value={selected.variantRole}
                    onValueChange={(value) =>
                      patchSelected({ variantRole: value as LogoVariantRole })
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VARIANT_OPTIONS.map(([id, label]) => (
                        <SelectItem key={id} value={id} className="text-xs">
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Text fallback</Label>
                  <Input
                    value={selected.textFallback ?? ""}
                    placeholder={brand.name}
                    className="h-8 text-xs"
                    onChange={(e) => patchSelected({ textFallback: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Usage</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {PREFERRED_USE_OPTIONS.map(([use, label]) => (
                    <label
                      key={use}
                      className="flex cursor-pointer items-center gap-2 text-xs"
                    >
                      <input
                        type="checkbox"
                        className="h-3.5 w-3.5 rounded border border-input"
                        checked={selected.preferredUse.includes(use)}
                        onChange={(e) => togglePreferredUse(use, e.target.checked)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Background compatibility</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {BACKGROUND_OPTIONS.map(([bg, label]) => (
                    <label
                      key={bg}
                      className="flex cursor-pointer items-center gap-2 text-xs"
                    >
                      <input
                        type="checkbox"
                        className="h-3.5 w-3.5 rounded border border-input"
                        checked={selected.backgroundCompatibility.includes(bg)}
                        onChange={(e) => toggleBackgroundCompat(bg, e.target.checked)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Optical weight</Label>
                  <Input
                    type="number"
                    min={0.5}
                    max={1.5}
                    step={0.02}
                    value={selected.opticalWeight}
                    className="h-8 text-xs"
                    onChange={(e) =>
                      patchSelected({ opticalWeight: Number.parseFloat(e.target.value) || 1 })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Clear space</Label>
                  <Input
                    type="number"
                    min={0.05}
                    max={0.4}
                    step={0.01}
                    value={selected.clearSpace}
                    className="h-8 text-xs"
                    onChange={(e) =>
                      patchSelected({ clearSpace: Number.parseFloat(e.target.value) || 0.15 })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Min height</Label>
                  <Input
                    type="number"
                    min={0.02}
                    max={0.3}
                    step={0.01}
                    value={selected.minHeight}
                    className="h-8 text-xs"
                    onChange={(e) =>
                      patchSelected({ minHeight: Number.parseFloat(e.target.value) || 0.04 })
                    }
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 rounded border border-input"
                    checked={selected.canUseSmall}
                    onChange={(e) => patchSelected({ canUseSmall: e.target.checked })}
                  />
                  Can use at small size
                </label>
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 rounded border border-input"
                    checked={selected.canCrop}
                    onChange={(e) => patchSelected({ canCrop: e.target.checked })}
                  />
                  Can crop
                </label>
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 rounded border border-input"
                    checked={selected.canAnimateParts}
                    onChange={(e) => patchSelected({ canAnimateParts: e.target.checked })}
                  />
                  Can animate parts
                </label>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
