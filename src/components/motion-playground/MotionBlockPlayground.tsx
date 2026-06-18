import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MOTION_ASPECT_RATIO_LABELS } from "@/config/motion/aspect-ratios";
import { motionFormatMap } from "@/config/formats";
import { playgroundBrandKits } from "@/config/motion-playground/brands";
import {
  buildAssetPresence,
  buildSlotContent,
  playgroundSampleAssets,
} from "@/config/motion-playground/test-scenarios";
import { useEditor } from "@/context/editor-context";
import {
  MOTION_BLOCK_FAMILIES,
  MOTION_BLOCK_STATUS_LABELS,
  duplicateBlock,
  getPlaygroundBlocks,
  isApprovedBlockUserLibraryReady,
  LIBRARY_VISIBILITY_WARNING,
  updateBlockStatus,
  validateMotionBlock,
} from "@/lib/motion-block-library";
import { cn } from "@/lib/utils";
import {
  PlaygroundComposition,
  getPlaygroundDuration,
} from "@/remotion/playground/PlaygroundComposition";
import {
  PlaygroundRightPanel,
  statusBadgeClass,
} from "@/components/motion-playground/PlaygroundRightPanel";
import type {
  MotionAspectRatio,
  MotionBlockLibraryEntry,
  MotionBlockStatus,
  PlaygroundDebugLayer,
  PlaygroundPreviewMode,
  PlaygroundTestScenario,
} from "@/types/motion-block-library";
import { Player, type PlayerRef } from "@remotion/player";
import {
  ArrowLeft,
  Copy,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Search,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const PLAYBACK_SPEEDS = [0.25, 0.5, 1, 1.5] as const;

const DEFAULT_DEBUG_LAYERS: PlaygroundDebugLayer[] = [
  "hard-safe",
  "slot-labels",
  "media-crops",
];

export function MotionBlockPlayground() {
  const { showMotionPlayground, setShowMotionPlayground, isAdminMode, showToast } = useEditor();

  const [blocks, setBlocks] = useState<MotionBlockLibraryEntry[]>(() => getPlaygroundBlocks());
  const [selectedId, setSelectedId] = useState(blocks[0]?.id ?? "");
  const [family, setFamily] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<MotionBlockStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [aspectRatio, setAspectRatio] = useState<MotionAspectRatio>("16:9");
  const [brandId, setBrandId] = useState(playgroundBrandKits[0].id);
  const [scenario, setScenario] = useState<PlaygroundTestScenario>("default");
  const [previewMode, setPreviewMode] = useState<PlaygroundPreviewMode>("styled");
  const [debugLayers, setDebugLayers] = useState<PlaygroundDebugLayer[]>(DEFAULT_DEBUG_LAYERS);
  const [isPlaying, setIsPlaying] = useState(true);
  const [loop, setLoop] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [previewQuality, setPreviewQuality] = useState<"draft" | "full">("draft");
  const [currentFrame, setCurrentFrame] = useState(0);
  const [inFrame, setInFrame] = useState(0);
  const [outFrame, setOutFrame] = useState<number | null>(null);
  const [customContent, setCustomContent] = useState<Record<string, string>>({});

  const playerRef = useRef<PlayerRef>(null);
  const previewAreaRef = useRef<HTMLDivElement>(null);
  const [previewSize, setPreviewSize] = useState<{ width: number; height: number } | null>(null);

  const selectedBlock = blocks.find((b) => b.id === selectedId) ?? blocks[0];
  const brand = playgroundBrandKits.find((b) => b.id === brandId) ?? playgroundBrandKits[0];
  const formatId = `format-${aspectRatio.replace(":", "-")}`;
  const format = motionFormatMap[formatId];

  const logoText = brand.logos.textFallback ?? "BRAND";
  const duration = selectedBlock ? getPlaygroundDuration(selectedBlock) : 90;
  const effectiveOutFrame = outFrame ?? duration - 1;

  const content = useMemo(() => {
    const base = buildSlotContent(selectedBlock?.id ?? "", scenario, logoText);
    return { ...base, ...customContent };
  }, [selectedBlock?.id, scenario, logoText, customContent]);

  const assetPresence = useMemo(
    () => buildAssetPresence(selectedBlock?.id ?? "", scenario),
    [selectedBlock?.id, scenario],
  );

  const warnings = useMemo(() => {
    if (!selectedBlock) return [];
    return validateMotionBlock(selectedBlock, aspectRatio, content, assetPresence, brand, scenario);
  }, [selectedBlock, aspectRatio, content, assetPresence, brand, scenario]);

  const libraryVisibilityWarning = useMemo(() => {
    if (!selectedBlock || selectedBlock.status !== "approved") return null;
    return isApprovedBlockUserLibraryReady(selectedBlock) ? null : LIBRARY_VISIBILITY_WARNING;
  }, [selectedBlock]);

  const filteredBlocks = useMemo(() => {
    return blocks.filter((block) => {
      if (family !== "all" && block.family !== family) return false;
      if (statusFilter !== "all" && block.status !== statusFilter) return false;
      if (search && !block.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [blocks, family, statusFilter, search]);

  useEffect(() => {
    if (!showMotionPlayground) return;
    const area = previewAreaRef.current;
    if (!area || !format) return;

    const update = () => {
      const { width, height } = area.getBoundingClientRect();
      const aspect = format.width / format.height;
      let w = width;
      let h = w / aspect;
      if (h > height) {
        h = height;
        w = h * aspect;
      }
      setPreviewSize({ width: Math.floor(w), height: Math.floor(h) });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(area);
    return () => observer.disconnect();
  }, [format, showMotionPlayground, aspectRatio]);

  useEffect(() => {
    if (selectedBlock) {
      setOutFrame(null);
      setInFrame(0);
      setCurrentFrame(0);
    }
  }, [selectedBlock?.id]);

  const togglePlay = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    if (isPlaying) {
      player.pause();
      setIsPlaying(false);
    } else {
      player.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const restart = useCallback(() => {
    setCurrentFrame(inFrame);
    playerRef.current?.seekTo(inFrame);
    if (!isPlaying) {
      playerRef.current?.play();
      setIsPlaying(true);
    }
  }, [inFrame, isPlaying]);

  const stepFrame = useCallback(
    (delta: number) => {
      const next = Math.max(inFrame, Math.min(effectiveOutFrame, currentFrame + delta));
      setCurrentFrame(next);
      playerRef.current?.seekTo(next);
    },
    [currentFrame, inFrame, effectiveOutFrame],
  );

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    const onFrame = () => {
      const frame = player.getCurrentFrame();
      setCurrentFrame(frame);
      if (!loop && frame >= effectiveOutFrame) {
        player.pause();
        setIsPlaying(false);
      }
    };
    player.addEventListener("frameupdate", onFrame);
    return () => player.removeEventListener("frameupdate", onFrame);
  }, [selectedBlock?.id, aspectRatio, brandId, scenario, loop, effectiveOutFrame]);

  const handleDuplicate = () => {
    if (!selectedBlock) return;
    const copy = duplicateBlock(selectedBlock);
    setBlocks((prev) => [...prev, copy]);
    setSelectedId(copy.id);
  };

  const handleCreateNew = () => {
    showToast({ message: "Open Block Builder to create a new block." });
  };

  const handleStatusChange = (status: MotionBlockLibraryEntry["status"]) => {
    if (!selectedBlock) return;
    const updated = updateBlockStatus(selectedBlock, status);
    setBlocks((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  };

  const handleSaveDraft = () => {
    if (!selectedBlock) return;
    handleStatusChange("draft");
    showToast({ message: `Saved "${selectedBlock.name}" as draft.` });
  };

  const handlePublish = () => {
    if (!selectedBlock) return;
    handleStatusChange("approved");
    showToast({ message: `Published "${selectedBlock.name}" as approved.` });
  };

  const toggleDebugLayer = (layer: PlaygroundDebugLayer) => {
    setDebugLayers((prev) =>
      prev.includes(layer) ? prev.filter((l) => l !== layer) : [...prev, layer],
    );
  };

  if (!isAdminMode || !showMotionPlayground || !selectedBlock || !format) return null;

  const activeDebugLayers =
    previewMode === "debug" ? debugLayers : previewMode === "grayscale" ? [] : [];

  const timestamp = (currentFrame / 30).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Top bar */}
      <header className="flex h-11 shrink-0 items-center gap-2 border-b border-border px-3">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5"
          onClick={() => setShowMotionPlayground(false)}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Button>
        <span className="truncate text-sm font-semibold">{selectedBlock.name}</span>
        <span
          className={cn(
            "rounded px-1.5 py-0.5 text-[9px] font-medium uppercase",
            statusBadgeClass(selectedBlock.status),
          )}
        >
          {MOTION_BLOCK_STATUS_LABELS[selectedBlock.status]}
        </span>

        <div className="ml-2 flex items-center gap-1.5">
          <Select value={aspectRatio} onValueChange={(v) => setAspectRatio(v as MotionAspectRatio)}>
            <SelectTrigger className="h-8 w-[90px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(MOTION_ASPECT_RATIO_LABELS) as MotionAspectRatio[]).map((ar) => (
                <SelectItem key={ar} value={ar}>
                  {ar}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={brandId} onValueChange={setBrandId}>
            <SelectTrigger className="h-8 w-[120px] text-xs">
              <SelectValue placeholder="Brand" />
            </SelectTrigger>
            <SelectContent>
              {playgroundBrandKits.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={previewMode} onValueChange={(v) => setPreviewMode(v as PlaygroundPreviewMode)}>
            <SelectTrigger className="h-8 w-[100px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="styled">Styled</SelectItem>
              <SelectItem value="grayscale">Grayscale</SelectItem>
              <SelectItem value="debug">Debug</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleSaveDraft}>
            Save draft
          </Button>
          <Button size="sm" className="h-8 text-xs" onClick={handlePublish}>
            Publish
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* Left panel */}
        <aside className="flex w-56 shrink-0 flex-col border-r border-border lg:w-64">
          <div className="border-b border-border px-3 py-2">
            <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Block library
            </h3>
          </div>
          <div className="border-b border-border p-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search blocks…"
                className="h-8 pl-7 text-xs"
              />
            </div>
          </div>

          <Tabs value={family} onValueChange={setFamily} className="border-b border-border px-2 py-1.5">
            <TabsList className="h-auto w-full flex-wrap justify-start gap-0.5 bg-transparent p-0">
              <TabsTrigger value="all" className="h-6 px-2 text-[10px]">
                All
              </TabsTrigger>
              {MOTION_BLOCK_FAMILIES.map((f) => (
                <TabsTrigger key={f.id} value={f.id} className="h-6 px-2 text-[10px]">
                  {f.label.split(" ")[0]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="border-b border-border px-2 py-1.5">
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as MotionBlockStatus | "all")}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {(["draft", "needs-review", "approved", "deprecated"] as const).map((s) => (
                  <SelectItem key={s} value={s}>
                    {MOTION_BLOCK_STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-1 border-b border-border p-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 flex-1 gap-1 text-[10px]"
              onClick={handleDuplicate}
            >
              <Copy className="h-3 w-3" />
              Duplicate
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 flex-1 gap-1 text-[10px]"
              onClick={handleCreateNew}
            >
              <Plus className="h-3 w-3" />
              New
            </Button>
          </div>

          <ul className="min-h-0 flex-1 overflow-y-auto p-1.5">
            {filteredBlocks.map((block) => (
              <li key={block.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(block.id);
                    setCustomContent({});
                    setCurrentFrame(0);
                  }}
                  className={cn(
                    "w-full rounded-md px-2 py-2 text-left transition-colors",
                    block.id === selectedId ? "bg-secondary" : "hover:bg-secondary/50",
                  )}
                >
                  <span className="block truncate text-xs font-medium">{block.name}</span>
                  <span className="mt-0.5 flex items-center gap-1.5">
                    <span
                      className={cn(
                        "rounded px-1 py-0.5 text-[9px] font-medium uppercase",
                        statusBadgeClass(block.status),
                      )}
                    >
                      {MOTION_BLOCK_STATUS_LABELS[block.status]}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* Center preview */}
        <main className="flex min-w-0 flex-1 flex-col">
          <div
            ref={previewAreaRef}
            className="flex min-h-0 flex-1 items-center justify-center bg-preview-surface p-4"
            style={previewMode === "grayscale" ? { filter: "grayscale(1)" } : undefined}
          >
            <div
              className="overflow-hidden rounded-md border border-border bg-black shadow-lg"
              style={
                previewSize
                  ? { width: previewSize.width, height: previewSize.height }
                  : { width: "100%", aspectRatio: `${format.width} / ${format.height}` }
              }
            >
              <Player
                ref={playerRef}
                key={`${selectedBlock.id}-${aspectRatio}-${brandId}-${scenario}-${activeDebugLayers.join(",")}-${previewQuality}`}
                component={PlaygroundComposition}
                inputProps={{
                  block: selectedBlock,
                  aspectRatio,
                  format,
                  brand,
                  content,
                  assets: playgroundSampleAssets,
                  assetPresence,
                  debugLayers: activeDebugLayers,
                }}
                durationInFrames={duration}
                compositionWidth={format.width}
                compositionHeight={format.height}
                fps={30}
                playbackRate={playbackSpeed}
                style={{ width: "100%", height: "100%" }}
                controls={false}
                loop={loop}
                autoPlay={isPlaying}
                clickToPlay={false}
                inFrame={inFrame}
                outFrame={effectiveOutFrame}
              />
            </div>
          </div>

          {/* Playback controls */}
          <div className="shrink-0 space-y-2 border-t border-border px-4 py-2">
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={togglePlay}>
                {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={restart}>
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant={loop ? "default" : "outline"}
                size="sm"
                className="h-8 text-[10px]"
                onClick={() => setLoop((v) => !v)}
              >
                Loop {loop ? "on" : "off"}
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => stepFrame(-1)}>
                <SkipBack className="h-3.5 w-3.5" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => stepFrame(1)}>
                <SkipForward className="h-3.5 w-3.5" />
              </Button>

              <Select
                value={String(playbackSpeed)}
                onValueChange={(v) => setPlaybackSpeed(Number(v))}
              >
                <SelectTrigger className="h-8 w-[80px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLAYBACK_SPEEDS.map((speed) => (
                    <SelectItem key={speed} value={String(speed)}>
                      {speed}x
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={previewQuality}
                onValueChange={(v) => setPreviewQuality(v as "draft" | "full")}
              >
                <SelectTrigger className="h-8 w-[90px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="full">Full</SelectItem>
                </SelectContent>
              </Select>

              <span className="text-[10px] tabular-nums text-muted-foreground">
                {timestamp}s · f{currentFrame}
              </span>
            </div>

            <Slider
              value={[currentFrame]}
              min={inFrame}
              max={effectiveOutFrame}
              step={1}
              onValueChange={([frame]) => {
                setCurrentFrame(frame);
                playerRef.current?.seekTo(frame);
              }}
            />

            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <label className="flex items-center gap-1">
                In
                <Input
                  type="number"
                  min={0}
                  max={duration - 1}
                  value={inFrame}
                  onChange={(e) => setInFrame(Number(e.target.value))}
                  className="h-7 w-14 px-1 text-xs"
                />
              </label>
              <label className="flex items-center gap-1">
                Out
                <Input
                  type="number"
                  min={0}
                  max={duration - 1}
                  value={effectiveOutFrame}
                  onChange={(e) => setOutFrame(Number(e.target.value))}
                  className="h-7 w-14 px-1 text-xs"
                />
              </label>
              <span>
                Range: {inFrame}–{effectiveOutFrame} / {duration - 1}
              </span>
            </div>
          </div>
        </main>

        {/* Right panel */}
        <aside className="flex w-64 shrink-0 flex-col border-l border-border lg:w-72">
          <div className="border-b border-border px-3 py-2">
            <Select
              value={selectedBlock.status}
              onValueChange={(v) => handleStatusChange(v as MotionBlockLibraryEntry["status"])}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["draft", "needs-review", "approved", "deprecated"] as const).map((s) => (
                  <SelectItem key={s} value={s}>
                    {MOTION_BLOCK_STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <PlaygroundRightPanel
            block={selectedBlock}
            brand={brand}
            scenario={scenario}
            aspectRatio={aspectRatio}
            content={content}
            warnings={warnings}
            libraryVisibilityWarning={libraryVisibilityWarning}
            debugLayers={debugLayers}
            onScenarioChange={setScenario}
            onContentChange={(slotId, value) =>
              setCustomContent((prev) => ({ ...prev, [slotId]: value }))
            }
            onToggleDebugLayer={toggleDebugLayer}
          />
        </aside>
      </div>
    </div>
  );
}
