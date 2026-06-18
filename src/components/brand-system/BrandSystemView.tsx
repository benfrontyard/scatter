import { BrandSystemPreview } from "@/components/brand-system/BrandSystemPreview";
import {
  BRAND_SYSTEM_NAV,
  BrandAdvancedSection,
  BrandColorsSection,
  BrandEffectsSection,
  BrandLogosSection,
  BrandMotionSection,
  BrandOverviewSection,
  BrandTypographySection,
  type BrandSystemSection,
} from "@/components/brand-system/brand-system-sections";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEditor } from "@/context/editor-context";
import { useMediaQuery } from "@/hooks/use-media-query";
import { mediaQueries } from "@/lib/breakpoints";
import { cn } from "@/lib/utils";
import type { BrandPreset } from "@/types";
import { ArrowLeft, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export function BrandSystemView() {
  const {
    brand,
    sequence,
    showBrandSystem,
    setShowBrandSystem,
    commitBrandDraft,
    duplicateBrandToCustom,
    assets,
    addAsset,
  } = useEditor();

  const isMobile = useMediaQuery(mediaQueries.mobile);
  const isTablet = useMediaQuery(mediaQueries.tablet);

  const [section, setSection] = useState<BrandSystemSection>("overview");
  const [draftBrand, setDraftBrand] = useState<BrandPreset>(() => structuredClone(brand));
  const [draftLogoText, setDraftLogoText] = useState(sequence.logoText ?? "");
  const [initialSnapshot, setInitialSnapshot] = useState<string>("");

  useEffect(() => {
    if (!showBrandSystem) return;
    const snapshot = JSON.stringify({ brand, logoText: sequence.logoText ?? "" });
    setInitialSnapshot(snapshot);
    setDraftBrand(structuredClone(brand));
    setDraftLogoText(sequence.logoText ?? "");
    setSection("overview");
  }, [showBrandSystem, brand, sequence.logoText]);

  const isDraftDirty = useMemo(() => {
    if (!initialSnapshot) return false;
    return (
      JSON.stringify({ brand: draftBrand, logoText: draftLogoText }) !== initialSnapshot
    );
  }, [draftBrand, draftLogoText, initialSnapshot]);

  if (!showBrandSystem) return null;

  const handleCancel = () => {
    setShowBrandSystem(false);
  };

  const handleSave = () => {
    commitBrandDraft(draftBrand, draftLogoText);
    setShowBrandSystem(false);
  };

  const sectionProps = {
    draftBrand,
    logoText: draftLogoText,
    assets,
    onBrandChange: setDraftBrand,
    onLogoTextChange: setDraftLogoText,
    onUploadAsset: addAsset,
    onDuplicate: () => duplicateBrandToCustom(brand.id),
  };

  const sectionContent = (() => {
    switch (section) {
      case "overview":
        return <BrandOverviewSection {...sectionProps} />;
      case "logos":
        return <BrandLogosSection {...sectionProps} />;
      case "colors":
        return <BrandColorsSection {...sectionProps} />;
      case "typography":
        return <BrandTypographySection {...sectionProps} />;
      case "motion":
        return <BrandMotionSection {...sectionProps} />;
      case "effects":
        return <BrandEffectsSection {...sectionProps} />;
      case "advanced":
        return <BrandAdvancedSection {...sectionProps} />;
      default:
        return null;
    }
  })();

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-background text-foreground">
      <header className="flex shrink-0 items-center gap-3 border-b border-border px-3 py-2.5 sm:px-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 gap-1.5 px-2"
          onClick={handleCancel}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back to editor</span>
        </Button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{draftBrand.name || "Brand system"}</p>
          <p className="truncate text-[11px] text-muted-foreground">
            Global brand rules · {isDraftDirty ? "Unsaved changes" : "Up to date"}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button type="button" variant="outline" size="sm" className="h-9" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-9 gap-1.5"
            onClick={handleSave}
            disabled={!isDraftDirty}
          >
            <Save className="h-3.5 w-3.5" />
            Save brand
          </Button>
        </div>
      </header>

      {isMobile ? (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <BrandSystemPreview
            brand={draftBrand}
            logoText={draftLogoText}
            assets={assets}
            collapsible
            className="shrink-0 border-b border-border"
          />
          <Tabs
            value={section}
            onValueChange={(value) => setSection(value as BrandSystemSection)}
            className="shrink-0 border-b border-border px-3 py-2"
          >
            <TabsList className="h-9 w-full justify-start overflow-x-auto">
              {BRAND_SYSTEM_NAV.map((item) => (
                <TabsTrigger key={item.id} value={item.id} className="text-xs">
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
            {sectionContent}
          </main>
        </div>
      ) : isTablet ? (
        <div className="grid min-h-0 flex-1 grid-rows-[minmax(200px,36%)_1fr] overflow-hidden lg:grid-cols-[200px_1fr] lg:grid-rows-1">
          <nav className="hidden border-r border-border p-3 lg:block">
            <NavList section={section} onSelect={setSection} />
          </nav>
          <Tabs
            value={section}
            onValueChange={(value) => setSection(value as BrandSystemSection)}
            className="border-b border-border px-3 py-2 lg:hidden"
          >
            <TabsList className="h-9 w-full justify-start overflow-x-auto">
              {BRAND_SYSTEM_NAV.map((item) => (
                <TabsTrigger key={item.id} value={item.id} className="text-xs">
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="grid min-h-0 grid-cols-1 overflow-hidden xl:grid-cols-[1fr_340px]">
            <main className="min-h-0 overflow-y-auto overscroll-contain p-5">{sectionContent}</main>
            <BrandSystemPreview
              brand={draftBrand}
              logoText={draftLogoText}
              assets={assets}
              className="hidden border-l border-border xl:flex"
            />
          </div>
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-[220px_minmax(0,1fr)_380px] overflow-hidden">
          <nav className="border-r border-border p-3">
            <NavList section={section} onSelect={setSection} />
          </nav>
          <main className="min-h-0 overflow-y-auto overscroll-contain p-6">{sectionContent}</main>
          <BrandSystemPreview
            brand={draftBrand}
            logoText={draftLogoText}
            assets={assets}
            className="border-l border-border"
          />
        </div>
      )}
    </div>
  );
}

function NavList({
  section,
  onSelect,
}: {
  section: BrandSystemSection;
  onSelect: (section: BrandSystemSection) => void;
}) {
  return (
    <ul className="space-y-0.5">
      {BRAND_SYSTEM_NAV.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            onClick={() => onSelect(item.id)}
            className={cn(
              "w-full rounded-md px-3 py-2 text-left text-sm transition-colors",
              section === item.id
                ? "bg-secondary font-medium text-foreground"
                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
            )}
          >
            {item.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
