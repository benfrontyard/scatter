import { Player } from "@remotion/player";
import { motionFormatMap } from "@/config/formats";
import { defaultFormatId } from "@/config/formats";
import { useGoogleFont } from "@/hooks/use-google-font";
import { cn } from "@/lib/utils";
import type { BrandPreset } from "@/types";
import {
  BrandSampleComposition,
  getBrandSampleDuration,
} from "@/remotion/BrandSampleComposition";
import { useEffect, useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

const SAMPLE_BLOCKS = [
  { id: "logo-reveal", label: "Logo Reveal" },
  { id: "feature-announcement", label: "Feature Announcement" },
  { id: "stat-card", label: "Stat Card" },
] as const;

type BrandSystemPreviewProps = {
  brand: BrandPreset;
  logoText: string;
  className?: string;
  collapsible?: boolean;
};

export function BrandSystemPreview({
  brand,
  logoText,
  className,
  collapsible = false,
}: BrandSystemPreviewProps) {
  const format = motionFormatMap[defaultFormatId];
  const [blockId, setBlockId] = useState<string>("feature-announcement");
  const [collapsed, setCollapsed] = useState(false);
  const areaRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  useGoogleFont(brand.typography.fontFamilies.heading);
  useGoogleFont(brand.typography.fontFamilies.body);
  useGoogleFont(brand.typography.fontFamilies.accent);

  const durationInFrames = getBrandSampleDuration(blockId);

  useEffect(() => {
    const area = areaRef.current;
    if (!area || collapsed) return;

    const update = () => {
      const { width, height } = area.getBoundingClientRect();
      const aspect = format.width / format.height;
      let w = width;
      let h = w / aspect;
      if (h > height) {
        h = height;
        w = h * aspect;
      }
      setSize({ width: Math.floor(w), height: Math.floor(h) });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(area);
    return () => observer.disconnect();
  }, [format.width, format.height, collapsed]);

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div>
          <p className="text-sm font-medium">Live preview</p>
          <p className="text-[11px] text-muted-foreground">Sample block with draft brand</p>
        </div>
        {collapsible ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? "Expand preview" : "Collapse preview"}
          >
            {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        ) : null}
      </div>

      {!collapsed ? (
        <>
          <div className="shrink-0 space-y-1.5 border-b border-border px-4 py-3">
            <Label className="text-[10px] text-muted-foreground">Sample block</Label>
            <Select value={blockId} onValueChange={setBlockId}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SAMPLE_BLOCKS.map((block) => (
                  <SelectItem key={block.id} value={block.id}>
                    {block.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div
            ref={areaRef}
            className="flex min-h-0 flex-1 items-center justify-center bg-[#0c0c0c] p-4"
          >
            <div
              className="overflow-hidden rounded-md border border-border bg-black shadow-lg"
              style={
                size
                  ? { width: size.width, height: size.height }
                  : { width: "100%", aspectRatio: `${format.width} / ${format.height}` }
              }
            >
              <Player
                key={`${blockId}-${brand.name}`}
                component={BrandSampleComposition}
                inputProps={{ brand, format, blockId, logoText }}
                durationInFrames={durationInFrames}
                compositionWidth={format.width}
                compositionHeight={format.height}
                fps={30}
                style={{ width: "100%", height: "100%" }}
                controls={false}
                loop
                autoPlay
              />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
