import { useEditor } from "@/context/editor-context";
import {
  exampleBrandKits,
  openKitInBrandLab,
} from "@/lib/brand-motion-kit-integration";
import { BRAND_KIT_TRANSITION_DEFAULTS } from "@/lib/transitions/presets";
import { getTransitionPreset } from "@/lib/transitions/presets";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Copy, ExternalLink, Plus, RotateCcw, X } from "lucide-react";

function ColorChips({ colors }: { colors: string[] }) {
  return (
    <div className="flex gap-1">
      {colors.slice(0, 4).map((color) => (
        <span
          key={color}
          className="h-4 w-4 rounded-full border border-border/50"
          style={{ backgroundColor: color }}
          title={color}
        />
      ))}
    </div>
  );
}

function BrandPreviewRow({ brandId }: { brandId: string }) {
  const { allBrands } = useEditor();
  const brand = allBrands.find((b) => b.id === brandId);
  if (!brand) return null;

  const transitionDefault = BRAND_KIT_TRANSITION_DEFAULTS[brandId];
  const transitionName = transitionDefault
    ? getTransitionPreset(transitionDefault.preset).name
    : "Soft Fade";

  return (
    <div className="flex items-center gap-3 rounded-md border border-border bg-muted/30 px-3 py-2">
      <ColorChips
        colors={[
          brand.colors.background,
          brand.colors.foreground,
          brand.colors.accent,
          brand.colors.muted,
        ]}
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium">{brand.typography.fontFamilies.heading}</p>
        <p className="truncate text-[10px] text-muted-foreground">
          {transitionName} · {brand.motion.intensity > 1 ? "Expressive" : "Balanced"} motion
        </p>
      </div>
      <span className="rounded bg-background px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {brand.logos.textFallback ?? brand.name.slice(0, 1)}
      </span>
    </div>
  );
}

function ExampleKitCard({
  kit,
  isActive,
  onUse,
}: {
  kit: (typeof exampleBrandKits)[0];
  isActive: boolean;
  onUse: () => void;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-3 transition-colors",
        isActive ? "border-primary bg-primary/5" : "border-border bg-card",
      )}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium">{kit.name}</p>
          <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">{kit.description}</p>
        </div>
        <ColorChips colors={kit.colors} />
      </div>
      <div className="mb-2 flex items-center gap-2 text-[10px] text-muted-foreground">
        <span className="truncate">{kit.typeSample}</span>
        <span>·</span>
        <span className="truncate capitalize">{kit.motionStyle}</span>
      </div>
      <Button
        type="button"
        variant={isActive ? "secondary" : "outline"}
        size="sm"
        className="h-7 w-full text-xs"
        onClick={onUse}
        disabled={isActive}
      >
        {isActive ? "Active kit" : "Use kit"}
      </Button>
    </div>
  );
}

export function BrandPanel() {
  const {
    showBrandPanel,
    setShowBrandPanel,
    brand,
    allBrands,
    setBrand,
    setShowBrandSystem,
    setShowStudio,
    setStudioTab,
    isInternal,
    applyExampleBrandKit,
    duplicateBrandToCustom,
    showToast,
  } = useEditor();

  if (!showBrandPanel) return null;

  const handleUseExampleKit = (kitId: string) => {
    applyExampleBrandKit(kitId);
    showToast({ message: `Switched to ${kitId} demo kit.` });
  };

  const handleResetToDefault = () => {
    setBrand("default-dark");
    showToast({ message: "Reset to Default Dark brand kit." });
  };

  const handleOpenInBrandLab = () => {
    setShowBrandPanel(false);
    setShowStudio(true);
    setStudioTab("brand-lab");
    openKitInBrandLab(brand.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-14 sm:justify-end sm:pt-16 sm:pr-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/30"
        aria-label="Close brand panel"
        onClick={() => setShowBrandPanel(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="brand-panel-title"
        className="relative z-10 flex max-h-[calc(100vh-4rem)] w-full max-w-md flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xl"
      >
        <div className="shrink-0 border-b border-border px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="brand-panel-title" className="text-sm font-semibold">
                Brand kit
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Choose the identity and motion rules for this video.
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={() => setShowBrandPanel(false)}
              aria-label="Close brand panel"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 space-y-5">
          <section>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Current kit
            </h3>
            <Select value={brand.id} onValueChange={setBrand}>
              <SelectTrigger className="h-9 w-full text-sm" aria-label="Brand preset">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allBrands.map((preset) => (
                  <SelectItem key={preset.id} value={preset.id}>
                    {preset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="mt-2">
              <BrandPreviewRow brandId={brand.id} />
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Example kits
            </h3>
            <div className="grid gap-2 sm:grid-cols-1">
              {exampleBrandKits.map((kit) => (
                <ExampleKitCard
                  key={kit.id}
                  kit={kit}
                  isActive={brand.id === kit.id}
                  onUse={() => handleUseExampleKit(kit.id)}
                />
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Actions
            </h3>
            <div className="flex flex-col gap-1.5">
              <Button
                type="button"
                variant="outline"
                className="h-9 w-full justify-start gap-2 text-sm"
                onClick={() => {
                  setShowBrandPanel(false);
                  setShowBrandSystem(true);
                }}
              >
                Edit current kit
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-9 w-full justify-start gap-2 text-sm"
                onClick={() => {
                  duplicateBrandToCustom(brand.id);
                  showToast({ message: "Duplicated kit to custom brand." });
                }}
              >
                <Copy className="h-3.5 w-3.5" />
                Duplicate kit
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-9 w-full justify-start gap-2 text-sm"
                onClick={() => {
                  setShowBrandPanel(false);
                  setShowBrandSystem(true);
                }}
              >
                <Plus className="h-3.5 w-3.5" />
                Create new kit
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-9 w-full justify-start gap-2 text-sm"
                onClick={handleResetToDefault}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset to default
              </Button>
              {isInternal ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="h-9 w-full justify-start gap-2 text-xs text-muted-foreground"
                  onClick={handleOpenInBrandLab}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open in Studio / Brand Lab
                </Button>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
