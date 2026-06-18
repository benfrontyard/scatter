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
  PLAYGROUND_TEST_SCENARIOS,
} from "@/config/motion-playground/test-scenarios";
import { useEditor } from "@/context/editor-context";
import { useStudio } from "@/context/studio-context";
import {
  MOTION_BLOCK_FAMILIES,
  MOTION_BLOCK_STATUS_LABELS,
  buildPlaygroundPreviewSequence,
  buildPreviewDiagnostics,
  canUseProductionPlaygroundRenderer,
  duplicateBlock,
  getRendererLabel,
  isApprovedBlockUserLibraryReady,
  LIBRARY_VISIBILITY_WARNING,
  previewShouldRender,
  PreviewErrorBoundary,
  updateBlockStatus,
  validateMotionBlock,
} from "@/lib/motion-block-library";
import { cn } from "@/lib/utils";
import {
  PlaygroundComposition,
  getPlaygroundDuration,
} from "@/remotion/playground/PlaygroundComposition";
import { ScatterComposition } from "@/remotion/ScatterComposition";
import { statusBadgeClass } from "@/components/motion-playground/PlaygroundRightPanel";
import { PreviewDiagnosticsPanel } from "@/components/studio/PreviewDiagnostics";
import { ReviewRightPanel } from "@/components/studio/ReviewRightPanel";
import { StudioContextualToolbar } from "@/components/studio/StudioContextualToolbar";
import type {
  MotionAspectRatio,
  MotionBlockStatus,
  PlaygroundDebugLayer,
  PlaygroundPreviewMode,
  PlaygroundTestScenario,
} from "@/types/motion-block-library";
import { Player, type PlayerRef } from "@remotion/player";
import {
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

export function StudioReview() {
  const { setStudioTab, showToast } = useEditor();
  const { blocks, selectedBlock, selectedBlockId, setSelectedBlockId, updateBlock, addBlock } =
    useStudio();

  const [family, setFamily] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<MotionBlockStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [aspectRatio, setAspectRatio] = useState<MotionAspectRatio>("16:9");
  const [brandId, setBrandId] = useState(playgroundBrandKits[0].id);
  const [scenario, setScenario] = useState<PlaygroundTestScenario>("default");
  const [previewMode, setPreviewMode] = useState<PlaygroundPreviewMode>("styled");
  const [debugLayers, setDebugLayers] = useState<PlaygroundDebugLayer[]>(DEFAULT_DEBUG_LAYERS);
  const [forceFallbackRenderer, setForceFallbackRenderer] = useState(false);
  const [showDiagnosticDetails, setShowDiagnosticDetails] = useState(false);
  const [productionRendererError, setProductionRendererError] = useState<string | null>(null);
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

  const usesProductionRenderer = useMemo(
    () => (selectedBlock ? canUseProductionPlaygroundRenderer(selectedBlock) : false),
    [selectedBlock],
  );

  const useProductionPath = usesProductionRenderer && !forceFallbackRenderer;

  const productionSequence = useMemo(() => {
    if (!selectedBlock || !useProductionPath) return null;
    return buildPlaygroundPreviewSequence(selectedBlock, {
      brandPresetId: brand.id,
      aspectRatio,
      content,
    });
  }, [selectedBlock, useProductionPath, brand.id, aspectRatio, content]);

  const warnings = useMemo(() => {
    if (!selectedBlock) return [];
    return validateMotionBlock(
      selectedBlock,
      aspectRatio,
      content,
      assetPresence,
      brand,
      scenario,
    );
  }, [selectedBlock, aspectRatio, content, assetPresence, brand, scenario]);

  const libraryVisibilityWarning = useMemo(() => {
    if (!selectedBlock || selectedBlock.status !== "approved") return null;
    return isApprovedBlockUserLibraryReady(selectedBlock) ? null : LIBRARY_VISIBILITY_WARNING;
  }, [selectedBlock]);

  const rendererLabel = getRendererLabel(usesProductionRenderer, forceFallbackRenderer);

  const diagnostics = useMemo(
    () =>
      buildPreviewDiagnostics({
        selectedBlock,
        aspectRatio,
        content,
        previewSize,
        format,
        usesProductionRenderer,
        forceFallbackRenderer,
        productionSequence,
        productionRendererError,
      }),
    [
      selectedBlock,
      aspectRatio,
      content,
      previewSize,
      format,
      usesProductionRenderer,
      forceFallbackRenderer,
      productionSequence,
      productionRendererError,
    ],
  );

  const previewRenderable = previewShouldRender(diagnostics) && Boolean(selectedBlock && format);

  const filteredBlocks = useMemo(() => {
    return blocks.filter((block) => {
      if (family !== "all" && block.family !== family) return false;
      if (statusFilter !== "all" && block.status !== statusFilter) return false;
      if (search && !block.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [blocks, family, statusFilter, search]);

  useEffect(() => {
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
  }, [format, aspectRatio]);

  useEffect(() => {
    if (selectedBlock) {
      setOutFrame(null);
      setInFrame(0);
      setCurrentFrame(0);
      setProductionRendererError(null);
      setForceFallbackRenderer(false);
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
    addBlock(copy);
  };

  const handleCreateNew = () => {
    setStudioTab("builder");
  };

  const handleStatusChange = (status: MotionBlockStatus) => {
    if (!selectedBlock) return;
    const updated = updateBlockStatus(selectedBlock, status);
    updateBlock(updated);
  };

  const handleApproveForSession = () => {
    if (!selectedBlock) return;
    handleStatusChange("approved");
    showToast({
      message: `"${selectedBlock.name}" approved for session only — not persisted.`,
    });
  };

  const handleExportJson = () => {
    if (!selectedBlock) return;
    const blob = new Blob([JSON.stringify(selectedBlock, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${selectedBlock.id}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    showToast({ message: `Exported "${selectedBlock.name}" as JSON.` });
  };

  const handleCopyConfig = async () => {
    if (!selectedBlock) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(selectedBlock, null, 2));
      showToast({ message: "Block config copied to clipboard." });
    } catch {
      showToast({ message: "Could not copy to clipboard." });
    }
  };

  const toggleDebugLayer = (layer: PlaygroundDebugLayer) => {
    setDebugLayers((prev) =>
      prev.includes(layer) ? prev.filter((l) => l !== layer) : [...prev, layer],
    );
  };

  const activeDebugLayers =
    previewMode === "debug" ? debugLayers : previewMode === "grayscale" ? [] : [];

  const timestamp = (currentFrame / 30).toFixed(2);

  const playerKey = useProductionPath
    ? `prod-${selectedBlock?.id}-${aspectRatio}-${brandId}-${scenario}-${previewQuality}`
    : `lib-${selectedBlock?.id}-${aspectRatio}-${brandId}-${scenario}-${activeDebugLayers.join(",")}-${previewQuality}`;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <StudioContextualToolbar
        block={selectedBlock}
        rendererLabel={rendererLabel}
        onMarkDraft={() => handleStatusChange("draft")}
        onMarkNeedsReview={() => handleStatusChange("needs-review")}
      />

      <div className="flex min-h-0 flex-1">
        {/* Left panel — block library */}
        <aside className="flex w-56 shrink-0 flex-col border-r border-border lg:w-64">
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
              variant="default"
              size="sm"
              className="h-7 flex-1 gap-1 text-[10px]"
              onClick={handleCreateNew}
            >
              <Plus className="h-3 w-3" />
              New Block
            </Button>
          </div>

          <ul className="min-h-0 flex-1 overflow-y-auto p-1.5">
            {filteredBlocks.map((block) => (
              <li key={block.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBlockId(block.id);
                    setCustomContent({});
                    setCurrentFrame(0);
                  }}
                  className={cn(
                    "w-full rounded-md px-2 py-2 text-left transition-colors",
                    block.id === selectedBlockId ? "bg-secondary" : "hover:bg-secondary/50",
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

        {/* Center — preview */}
        <main className="flex min-w-0 flex-1 flex-col">
          <div className="flex shrink-0 flex-wrap items-center gap-1.5 border-b border-border px-3 py-1.5">
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

            <Select value={scenario} onValueChange={(v) => setScenario(v as PlaygroundTestScenario)}>
              <SelectTrigger className="h-8 w-[130px] text-xs">
                <SelectValue placeholder="Scenario" />
              </SelectTrigger>
              <SelectContent>
                {PLAYGROUND_TEST_SCENARIOS.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span className="ml-auto text-[10px] text-muted-foreground">
              {rendererLabel === "Playground fallback" ? (
                <span className="text-amber-600">Renderer: Playground fallback</span>
              ) : (
                <span>Renderer: Production</span>
              )}
            </span>
          </div>

          <div
            ref={previewAreaRef}
            className="flex min-h-0 flex-1 items-center justify-center bg-preview-surface p-4"
            style={previewMode === "grayscale" ? { filter: "grayscale(1)" } : undefined}
          >
            {!previewRenderable || productionRendererError || !selectedBlock || !format ? (
              <PreviewDiagnosticsPanel
                diagnostics={diagnostics}
                rendererLabel={rendererLabel}
                onUseFallback={() => setForceFallbackRenderer(true)}
                onViewDiagnostics={() => setShowDiagnosticDetails((v) => !v)}
                showDetails={showDiagnosticDetails}
              />
            ) : (
              <div
                className="overflow-hidden rounded-md border border-border bg-black shadow-lg"
                style={
                  previewSize
                    ? { width: previewSize.width, height: previewSize.height }
                    : { width: "100%", aspectRatio: `${format.width} / ${format.height}` }
                }
              >
                <PreviewErrorBoundary
                  onError={(msg) => setProductionRendererError(msg)}
                  onReset={() => setProductionRendererError(null)}
                >
                  {useProductionPath && productionSequence ? (
                    <Player
                      ref={playerRef}
                      key={playerKey}
                      component={ScatterComposition}
                      inputProps={{
                        sequence: productionSequence,
                        customBrands: [brand],
                        assets: playgroundSampleAssets,
                        renderMode: "preview",
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
                  ) : (
                    <Player
                      ref={playerRef}
                      key={playerKey}
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
                  )}
                </PreviewErrorBoundary>
              </div>
            )}
          </div>

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

              <Select value={String(playbackSpeed)} onValueChange={(v) => setPlaybackSpeed(Number(v))}>
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
          {selectedBlock ? (
            <ReviewRightPanel
              block={selectedBlock}
              brands={playgroundBrandKits}
              brand={brand}
              scenario={scenario}
              aspectRatio={aspectRatio}
              content={content}
              warnings={warnings}
              libraryVisibilityWarning={libraryVisibilityWarning}
              debugLayers={debugLayers}
              previewRenderable={previewRenderable}
              productionRendererAvailable={usesProductionRenderer}
              productionRendererSucceeded={!productionRendererError && Boolean(productionSequence)}
              usingFallbackRenderer={forceFallbackRenderer || !usesProductionRenderer}
              rendererLabel={rendererLabel}
              onStatusChange={handleStatusChange}
              onApproveForSession={handleApproveForSession}
              onExportJson={handleExportJson}
              onCopyConfig={handleCopyConfig}
              onContentChange={(slotId, value) =>
                setCustomContent((prev) => ({ ...prev, [slotId]: value }))
              }
              onToggleDebugLayer={toggleDebugLayer}
            />
          ) : null}
        </aside>
      </div>
    </div>
  );
}
