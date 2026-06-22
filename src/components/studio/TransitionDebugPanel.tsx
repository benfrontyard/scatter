import { useEditor } from "@/context/editor-context";
import { getBeatSyncedTransitionStart } from "@/lib/transitions/beat-handoff";
import { getBlockStartFrame, getTransitionBetweenBlocks, getTransitionOverlapFrames } from "@/lib/sequence-utils";
import {
  blocksShareHeroGeometry,
  canUseCutOnAction,
  canUseMatchCut,
  getBlockTransitionMetadata,
} from "@/lib/transitions/block-metadata";
import { getTransitionPresetId } from "@/lib/transitions/migrate-transition";
import { getTransitionPreset } from "@/lib/transitions/presets";
import {
  getResponsiveTravelScale,
} from "@/lib/transitions/responsive-handoff";
import { motionFormatMap } from "@/config/formats";
import { resolveHeroGeometryRect } from "@/lib/transitions/hero-geometry";
import { getPoseEnterModifiers } from "@/lib/transitions/pose-motion";
import { resolveHandoffMode } from "@/remotion/handoff-motion";
import { EDITOR_FPS } from "@/types/editor";
import { useMemo } from "react";

type TransitionDebugProps = {
  blockIndex: number;
};

/** Internal-only transition timing readout for Studio diagnostics. */
export function TransitionDebugPanel({ blockIndex }: TransitionDebugProps) {
  const { sequence, currentFrame } = useEditor();
  const fps = sequence.fps ?? EDITOR_FPS;

  const debug = useMemo(() => {
    const block = sequence.blocks[blockIndex];
    const nextBlock = sequence.blocks[blockIndex + 1];
    const transition = getTransitionBetweenBlocks(sequence, blockIndex);
    const startFrame = getBlockStartFrame(sequence, blockIndex);

    if (!block || !transition) {
      return null;
    }

    const presetId = getTransitionPresetId(transition);
    const overlapFrames = getTransitionOverlapFrames(transition);
    const transitionStart = startFrame + block.duration - overlapFrames;
    const preset = getTransitionPreset(presetId);
    const handoffMode = resolveHandoffMode(presetId);

    const fromMeta = getBlockTransitionMetadata(block.blockId);
    const toMeta = nextBlock ? getBlockTransitionMetadata(nextBlock.blockId) : undefined;

    const beatMarkers =
      sequence.audio?.markers
        ?.filter((m) => m.type === "beat")
        .map((m) => Math.round(m.time * fps)) ?? [];

    const snappedStart =
      beatMarkers.length > 0
        ? getBeatSyncedTransitionStart(transitionStart, beatMarkers, 5)
        : transitionStart;

    const aspectRatio = motionFormatMap[sequence.format]?.aspectRatio ?? "16:9";
    const travelScale = getResponsiveTravelScale(aspectRatio);
    const fromRect = resolveHeroGeometryRect(fromMeta.heroGeometryId, fromMeta.preferredExitPose);
    const toRect = nextBlock
      ? resolveHeroGeometryRect(toMeta?.heroGeometryId, toMeta?.preferredEntryPose)
      : undefined;
    const spatialDelta =
      fromRect && toRect
        ? {
            dx: Math.round((fromRect.centerX - toRect.centerX) * 100),
            dy: Math.round((fromRect.centerY - toRect.centerY) * 100),
          }
        : null;
    const entryPoseMods = toMeta?.preferredEntryPose
      ? getPoseEnterModifiers(toMeta.preferredEntryPose, 0, handoffMode)
      : null;

    return {
      sceneName: block.blockId,
      nextScene: nextBlock?.blockId ?? "—",
      transitionName: preset.name,
      presetId,
      handoffMode,
      transitionStart,
      snappedStart,
      durationFrames: transition.duration,
      overlapFrames,
      beatAligned: snappedStart !== transitionStart,
      sharedGeometry: nextBlock
        ? blocksShareHeroGeometry(block.blockId, nextBlock.blockId)
        : false,
      matchCutOk: nextBlock ? canUseMatchCut(block.blockId, nextBlock.blockId) : false,
      cutOnActionOk: nextBlock ? canUseCutOnAction(block.blockId, nextBlock.blockId) : false,
      aspectRatio,
      travelScale,
      spatialDelta,
      entryTravelScale: entryPoseMods?.travelScale,
      exitPose: fromMeta.preferredExitPose ?? "—",
      entryPose: toMeta?.preferredEntryPose ?? "—",
      currentFrame,
      localFrame: currentFrame - startFrame,
      assetReady: true,
    };
  }, [sequence, blockIndex, currentFrame, fps]);

  if (!debug) {
    return (
      <p className="text-xs text-muted-foreground">No transition after this block.</p>
    );
  }

  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 font-mono text-[10px]">
      <div>
        <dt className="text-muted-foreground">Scene</dt>
        <dd>{debug.sceneName}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Next</dt>
        <dd>{debug.nextScene}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Transition</dt>
        <dd>{debug.transitionName}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Handoff</dt>
        <dd>{debug.handoffMode}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Start frame</dt>
        <dd>
          {debug.transitionStart}
          {debug.beatAligned ? ` → ${debug.snappedStart}` : ""}
        </dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Duration</dt>
        <dd>{debug.durationFrames}f</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Overlap</dt>
        <dd>{debug.overlapFrames}f</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Geometry</dt>
        <dd>{debug.sharedGeometry ? "shared" : "none"}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Aspect</dt>
        <dd>{debug.aspectRatio}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Travel scale</dt>
        <dd>{debug.travelScale.toFixed(2)}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Spatial Δ</dt>
        <dd>
          {debug.spatialDelta
            ? `${debug.spatialDelta.dx}%, ${debug.spatialDelta.dy}%`
            : "—"}
        </dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Pose travel</dt>
        <dd>{debug.entryTravelScale?.toFixed(2) ?? "—"}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Exit pose</dt>
        <dd>{debug.exitPose}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Entry pose</dt>
        <dd>{debug.entryPose}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Match cut</dt>
        <dd>{debug.matchCutOk ? "yes" : "no"}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Cut on action</dt>
        <dd>{debug.cutOnActionOk ? "yes" : "no"}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Local frame</dt>
        <dd>{debug.localFrame}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">Assets</dt>
        <dd className={debug.assetReady ? "text-green-600" : "text-amber-600"}>
          {debug.assetReady ? "Ready" : "Loading"}
        </dd>
      </div>
    </dl>
  );
}
