import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motionFormatMap } from "@/config/formats";
import {
  buildAssetPresence,
  buildSlotContent,
  playgroundSampleAssets,
  PLAYGROUND_TEST_SCENARIOS,
} from "@/config/motion-playground/test-scenarios";
import { useEditor } from "@/context/editor-context";
import { useStudio } from "@/context/studio-context";
import { studioBrandPresets } from "@/lib/brand-motion-kit-adapter";
import {
  MOTION_BLOCK_FAMILIES,
  MOTION_BLOCK_STATUS_LABELS,
  STUDIO_STATUS_ORDER,
  buildBlockQueueRow,
  sortQueueRows,
  buildPlaygroundPreviewSequence,
  buildPreviewDiagnostics,
  buildBlockHandoffPackage,
  canApproveBlock,
  canUseProductionPlaygroundRenderer,
  copyBlocksTsPatch,
  downloadBlockHandoffPackage,
  duplicateBlock,
  getApprovalChecklist,
  getBlockPrimaryAction,
  getRendererLabel,
  isApprovedBlockUserLibraryReady,
  isPublishedStatus,
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
import { EditorShell } from "@/components/layout/EditorShell";
import { EditorStageArea, EditorStageFrame } from "@/components/layout/EditorStageFrame";
import { BlockInspector } from "@/components/studio/BlockInspector";
import { PreviewDiagnosticsPanel } from "@/components/studio/PreviewDiagnostics";
import { SessionModeBanner } from "@/components/studio/SessionModeBanner";
import { StudioPlaybackBar } from "@/components/studio/StudioPlaybackBar";
import { useStudioWorkbench } from "@/context/studio-workbench-context";
import { fitCanvasToContainer } from "@/lib/editor-canvas";
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
  Plus,
  Search,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";

const DEFAULT_DEBUG_LAYERS: PlaygroundDebugLayer[] = [
  "hard-safe",
  "slot-labels",
  "media-crops",
];

const DEBUG_TOGGLES: { id: PlaygroundDebugLayer; label: string }[] = [
  { id: "hard-safe", label: "Hard safe" },
  { id: "slot-labels", label: "Slot boxes" },
  { id: "media-crops", label: "Media crops" },
  { id: "text-overflow", label: "Text overflow" },
];

const familyLabelMap = Object.fromEntries(
  MOTION_BLOCK_FAMILIES.map((f) => [f.id, f.label]),
) as Record<string, string>;

type BlockWorkbenchProps = {
  onNewBlock: () => void;
};

export function BlockWorkbench({ onNewBlock }: BlockWorkbenchProps) {
  const { showToast } = useEditor();
  const { setControls } = useStudioWorkbench();
  const { blocks, selectedBlock, selectedBlockId, setSelectedBlockId, updateBlock, addBlock } =
    useStudio();

  const [family, setFamily] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<
    MotionBlockStatus | "all" | "needs-attention"
  >("needs-attention");
  const [search, setSearch] = useState("");
  const [aspectRatio, setAspectRatio] = useState<MotionAspectRatio>("16:9");
  const [brandId, setBrandId] = useState(studioBrandPresets[0].id);
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
  const [inspectorTab, setInspectorTab] = useState("review");
  const [selectedFailure, setSelectedFailure] = useState<string | null>(null);
  const [showAdvancedPlayback, setShowAdvancedPlayback] = useState(false);
  const [showPreviewSettings, setShowPreviewSettings] = useState(false);
  const [isPreviewPending, startPreviewTransition] = useTransition();

  const playerRef = useRef<PlayerRef>(null);
  const previewAreaRef = useRef<HTMLDivElement>(null);
  const lastFramePaintRef = useRef(0);
  const [previewSize, setPreviewSize] = useState<{ width: number; height: number } | null>(null);

  const brand = studioBrandPresets.find((b) => b.id === brandId) ?? studioBrandPresets[0];
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
    if (!selectedBlock || !isPublishedStatus(selectedBlock.status)) return null;
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

  const queueRows = useMemo(
    () =>
      blocks.map((block) =>
        buildBlockQueueRow(
          block,
          studioBrandPresets,
          familyLabelMap[block.family] ?? block.family,
        ),
      ),
    [blocks],
  );

  const queueRowById = useMemo(
    () => new Map(queueRows.map((row) => [row.block.id, row])),
    [queueRows],
  );

  const attentionCount = queueRows.filter((row) => row.needsAttention).length;

  const filteredBlocks = useMemo(() => {
    const matched = blocks.filter((block) => {
      const row = queueRowById.get(block.id);
      if (family !== "all" && block.family !== family) return false;
      if (statusFilter === "needs-attention" && !row?.needsAttention) return false;
      if (
        statusFilter !== "all" &&
        statusFilter !== "needs-attention" &&
        block.status !== statusFilter
      )
        return false;
      if (search && !block.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

    if (selectedBlockId && !matched.some((b) => b.id === selectedBlockId)) {
      const selected = blocks.find((b) => b.id === selectedBlockId);
      if (selected) return [selected, ...matched];
    }

    return sortQueueRows(
      matched.map((block) => queueRowById.get(block.id)).filter((row) => row != null),
    ).map((row) => row.block);
  }, [blocks, family, statusFilter, search, queueRowById, selectedBlockId]);

  useEffect(() => {
    const area = previewAreaRef.current;
    if (!area || !format) return;

    const update = () => {
      const { width, height } = area.getBoundingClientRect();
      setPreviewSize(
        fitCanvasToContainer(width, height, format.width, format.height),
      );
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
      const now = performance.now();
      if (now - lastFramePaintRef.current >= 100) {
        lastFramePaintRef.current = now;
        setCurrentFrame(frame);
      }
      if (!loop && frame >= effectiveOutFrame) {
        player.pause();
        setIsPlaying(false);
        setCurrentFrame(frame);
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

  const handleStatusChange = (status: MotionBlockStatus) => {
    if (!selectedBlock) return;
    const updated = updateBlockStatus(selectedBlock, status);
    updateBlock(updated);
  };

  const handlePrimaryAction = () => {
    if (!selectedBlock) return;

    const checklist = getApprovalChecklist({
      block: selectedBlock,
      aspectRatio,
      warnings,
      previewRenderable,
      productionRendererAvailable: usesProductionRenderer,
      productionRendererSucceeded: !productionRendererError && Boolean(productionSequence),
      usingFallbackRenderer: forceFallbackRenderer || !usesProductionRenderer,
    });
    const canAdvance = canApproveBlock(checklist);
    const action = getBlockPrimaryAction(selectedBlock.status, canAdvance);

    if (action.action === "status-change" && action.nextStatus) {
      handleStatusChange(action.nextStatus);
      showToast({
        message: `"${selectedBlock.name}" → ${action.nextStatus.replace(/-/g, " ")} (session only).`,
      });
      return;
    }

    if (action.action === "export-publish") {
      handleExportPublishPackage(checklist);
      return;
    }

    if (action.action === "export-review") {
      handleExportReviewPackage(checklist);
      return;
    }

    if (action.action === "deprecate" && action.nextStatus) {
      handleStatusChange(action.nextStatus);
      showToast({ message: `"${selectedBlock.name}" marked deprecated (session only).` });
    }
  };

  const handleExportPublishPackage = (
    checklist: ReturnType<typeof getApprovalChecklist>,
  ) => {
    if (!selectedBlock) return;
    const pkg = buildBlockHandoffPackage({
      block: { ...selectedBlock, status: "ready-to-publish" },
      checklist,
      mode: "publish",
    });
    downloadBlockHandoffPackage(pkg);
    showToast({ message: "Publish package downloaded — merge into blocks.ts manually." });
  };

  const handleExportReviewPackage = (
    checklist: ReturnType<typeof getApprovalChecklist>,
  ) => {
    if (!selectedBlock) return;
    const pkg = buildBlockHandoffPackage({ block: selectedBlock, checklist, mode: "review" });
    downloadBlockHandoffPackage(pkg);
    showToast({ message: "Review package downloaded." });
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

  const handleCopyPatch = async () => {
    if (!selectedBlock) return;
    try {
      await copyBlocksTsPatch(selectedBlock);
      showToast({ message: "blocks.ts patch copied to clipboard." });
    } catch {
      showToast({ message: "Could not copy to clipboard." });
    }
  };

  useEffect(() => {
    setControls({
      blockName: selectedBlock?.name ?? null,
      blockStatus: selectedBlock?.status ?? null,
      aspectRatio,
      setAspectRatio,
      brandId,
      setBrandId,
      brandName: brand.name,
      showPreviewSettings,
      setShowPreviewSettings,
      onCopyPatch: handleCopyPatch,
      onExportJson: handleExportJson,
    });
    return () => setControls(null);
  }, [
    selectedBlock?.name,
    selectedBlock?.status,
    aspectRatio,
    brandId,
    brand.name,
    showPreviewSettings,
    setControls,
  ]);

  const toggleDebugLayer = (layer: PlaygroundDebugLayer) => {
    setDebugLayers((prev) =>
      prev.includes(layer) ? prev.filter((l) => l !== layer) : [...prev, layer],
    );
  };

  const handleMatrixCellClick = (
    nextBrandId: string,
    nextAspect: MotionAspectRatio,
    failure?: string,
  ) => {
    setBrandId(nextBrandId);
    setAspectRatio(nextAspect);
    if (failure) {
      setSelectedFailure(failure);
      setInspectorTab("review");
      if (failure.toLowerCase().includes("text") || failure.toLowerCase().includes("long")) {
        setScenario("long-text");
      }
      if (!debugLayers.includes("text-overflow")) {
        setDebugLayers((prev) => [...prev, "text-overflow"]);
      }
      setPreviewMode("debug");
    } else {
      setSelectedFailure(null);
    }
  };

  const activeDebugLayers =
    previewMode === "debug" ? debugLayers : previewMode === "grayscale" ? [] : [];

  const playerKey = useProductionPath
    ? `prod-${selectedBlock?.id}-${aspectRatio}-${brandId}-${scenario}-${previewQuality}`
    : `lib-${selectedBlock?.id}-${aspectRatio}-${brandId}-${scenario}-${activeDebugLayers.join(",")}-${previewQuality}`;

  const leftPanel = (
    <>
      <div className="space-y-1.5 border-b border-border px-2.5 py-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search blocks…"
            className="h-8 border-border/60 bg-background pl-7 text-xs"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) =>
            setStatusFilter(v as MotionBlockStatus | "all" | "needs-attention")
          }
        >
          <SelectTrigger className="h-8 w-full border-border/60 bg-background text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="needs-attention">Needs attention ({attentionCount})</SelectItem>
            <SelectItem value="all">All blocks</SelectItem>
            {STUDIO_STATUS_ORDER.filter((s) => s !== "approved").map((s) => (
              <SelectItem key={s} value={s}>
                {MOTION_BLOCK_STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs value={family} onValueChange={setFamily} className="border-b border-border px-2 py-1.5">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0">
          <TabsTrigger
            value="all"
            className="h-6 rounded-full px-2.5 text-[11px] data-[state=active]:bg-secondary"
          >
            All
          </TabsTrigger>
          {MOTION_BLOCK_FAMILIES.map((f) => (
            <TabsTrigger
              key={f.id}
              value={f.id}
              className="h-6 rounded-full px-2.5 text-[11px] data-[state=active]:bg-secondary"
            >
              {f.label.split(" ")[0]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="flex gap-1 border-b border-border px-2 py-1.5">
        <Button
          variant="outline"
          size="sm"
          className="h-7 flex-1 gap-1 text-[11px]"
          onClick={handleDuplicate}
        >
          <Copy className="h-3 w-3" />
          Duplicate
        </Button>
        <Button variant="default" size="sm" className="h-7 flex-1 gap-1 text-[11px]" onClick={onNewBlock}>
          <Plus className="h-3 w-3" />
          New
        </Button>
      </div>

      <ul className="min-h-0 flex-1 overflow-y-auto px-2 py-1.5">
        {filteredBlocks.map((block) => {
          const row = queueRowById.get(block.id);
          const isSelected = block.id === selectedBlockId;
          return (
            <li key={block.id} className="mb-1">
              <button
                type="button"
                onClick={() => {
                  startPreviewTransition(() => {
                    setSelectedBlockId(block.id);
                    setCustomContent({});
                    setSelectedFailure(null);
                  });
                  setCurrentFrame(0);
                  lastFramePaintRef.current = 0;
                }}
                className={cn(
                  "w-full rounded-md border px-2 py-1.5 text-left transition-colors",
                  isSelected
                    ? "border-border bg-secondary shadow-sm"
                    : "border-transparent hover:border-border/50 hover:bg-secondary/40",
                  isPreviewPending && isSelected && "opacity-70",
                )}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "h-1.5 w-1.5 shrink-0 rounded-full",
                      row?.needsAttention ? "bg-amber-500" : "bg-emerald-500/70",
                    )}
                  />
                  <span className="block min-w-0 flex-1 truncate text-xs font-medium">
                    {block.name}
                  </span>
                </div>
                <p className="mt-0.5 truncate pl-3 text-[10px] text-muted-foreground">
                  {row?.mainBlocker && isSelected
                    ? row.mainBlocker
                    : MOTION_BLOCK_STATUS_LABELS[block.status]}
                </p>
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );

  const centerStage = (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      {showPreviewSettings ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border bg-card px-3 py-2">
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

          <Select
            value={previewMode}
            onValueChange={(v) => setPreviewMode(v as PlaygroundPreviewMode)}
          >
            <SelectTrigger className="h-8 w-[100px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="styled">Styled</SelectItem>
              <SelectItem value="grayscale">Grayscale</SelectItem>
              <SelectItem value="debug">Debug</SelectItem>
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

          {previewMode === "debug" ? (
            <div className="flex flex-wrap gap-1">
              {DEBUG_TOGGLES.map((layer) => (
                <button
                  key={layer.id}
                  type="button"
                  onClick={() => toggleDebugLayer(layer.id)}
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] transition-colors",
                    debugLayers.includes(layer.id)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground",
                  )}
                >
                  {layer.label}
                </button>
              ))}
            </div>
          ) : null}

          <span className="ml-auto hidden text-[11px] text-muted-foreground sm:inline">
            {rendererLabel}
          </span>
        </div>
      ) : null}

      <EditorStageArea
        innerRef={previewAreaRef}
        className={cn("transition-opacity", isPreviewPending && "opacity-60")}
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
          <EditorStageFrame
            width={previewSize?.width}
            height={previewSize?.height}
            aspectRatio={previewSize ? undefined : `${format.width} / ${format.height}`}
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
          </EditorStageFrame>
        )}
      </EditorStageArea>
    </div>
  );

  return (
    <EditorShell
      mode="studio"
      embedded
      notificationBanner={
        <SessionModeBanner onCopyPatch={handleCopyPatch} onExportPatch={handleExportJson} />
      }
      leftPanel={leftPanel}
      centerStage={centerStage}
      inspectorPanel={
        selectedBlock ? (
          <BlockInspector
            block={selectedBlock}
            brands={studioBrandPresets}
            brand={brand}
            scenario={scenario}
            aspectRatio={aspectRatio}
            content={content}
            warnings={warnings}
            libraryVisibilityWarning={libraryVisibilityWarning}
            previewRenderable={previewRenderable}
            productionRendererAvailable={usesProductionRenderer}
            productionRendererSucceeded={!productionRendererError && Boolean(productionSequence)}
            usingFallbackRenderer={forceFallbackRenderer || !usesProductionRenderer}
            selectedFailure={selectedFailure}
            activeTab={inspectorTab}
            onTabChange={setInspectorTab}
            onStatusChange={handleStatusChange}
            onPrimaryAction={handlePrimaryAction}
            onExportJson={handleExportJson}
            onCopyPatch={handleCopyPatch}
            onContentChange={(slotId, value) =>
              setCustomContent((prev) => ({ ...prev, [slotId]: value }))
            }
            onMatrixCellClick={handleMatrixCellClick}
          />
        ) : null
      }
      bottomPanel={
        <StudioPlaybackBar
          isPlaying={isPlaying}
          onTogglePlay={togglePlay}
          onRestart={restart}
          currentFrame={currentFrame}
          inFrame={inFrame}
          effectiveOutFrame={effectiveOutFrame}
          duration={duration}
          aspectRatio={aspectRatio}
          brandName={brand.name}
          blockName={selectedBlock?.name}
          onSeek={(frame) => {
            setCurrentFrame(frame);
            playerRef.current?.seekTo(frame);
          }}
          showAdvanced={showAdvancedPlayback}
          onToggleAdvanced={() => setShowAdvancedPlayback((v) => !v)}
          playbackSpeed={playbackSpeed}
          onPlaybackSpeedChange={setPlaybackSpeed}
          loop={loop}
          onLoopToggle={() => setLoop((v) => !v)}
          onStepFrame={stepFrame}
          inFrameValue={inFrame}
          onInFrameChange={setInFrame}
          effectiveOutFrameValue={effectiveOutFrame}
          onOutFrameChange={(frame) => setOutFrame(frame)}
        />
      }
    />
  );
}
