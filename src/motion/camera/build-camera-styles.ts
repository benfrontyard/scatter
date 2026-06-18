import { getEasingFunctionById } from "@/lib/easing";
import {
  getLensPerspective,
  lerpCameraState,
  normalizeBlock3DSettings,
  normalizeCameraSettings,
} from "@/lib/camera";
import { getSequenceDurationInFrames } from "@/lib/sequence-utils";
import type { Block3DSettings, CameraRenderMode, CameraSettings, CameraState } from "@/types/camera";
import type { MotionBlockInstance, MotionSequence } from "@/types";
import type { CSSProperties } from "react";

type ResolvedCameraContext = {
  state: CameraState;
  progress: number;
  perspective: number;
  driftOffset: { x: number; y: number };
  shakeOffset: { x: number; y: number };
};

function getFocusTargetBlocks(blocks: MotionBlockInstance[]): MotionBlockInstance[] {
  return blocks.filter((block) => {
    const settings = normalizeBlock3DSettings(block.block3D);
    return settings?.canBeFocusTarget !== false;
  });
}

export function resolveFocusShiftOffset(
  sequence: MotionSequence,
  progress: number,
  focusTargetBlockId?: string,
): { x: number; y: number; z: number } {
  const focusBlocks = getFocusTargetBlocks(sequence.blocks);
  if (focusBlocks.length === 0) return { x: 0, y: 0, z: 0 };

  if (focusTargetBlockId) {
    const index = focusBlocks.findIndex((block) => block.id === focusTargetBlockId);
    if (index >= 0) {
      const blockProgress = (index / Math.max(focusBlocks.length - 1, 1)) * progress;
      return {
        x: 0,
        y: 0,
        z: -30 - blockProgress * 40,
      };
    }
  }

  const blockIndex = Math.min(
    focusBlocks.length - 1,
    Math.floor(progress * focusBlocks.length),
  );
  const localProgress =
    focusBlocks.length <= 1
      ? progress
      : (progress * focusBlocks.length) % 1 || (progress >= 1 ? 1 : 0);

  const zBase = -25 - blockIndex * 20;
  const z = zBase - localProgress * 20;

  return { x: 0, y: 0, z };
}

export function resolveCameraStateAtFrame(
  camera: CameraSettings | undefined,
  sequence: MotionSequence,
  frame: number,
  reducedMotion = false,
): ResolvedCameraContext {
  const settings = normalizeCameraSettings(camera);
  const perspective = getLensPerspective(
    settings.lensPreset ?? "natural",
    settings.focalLength ?? 50,
    settings.perspectiveStrength ?? 50,
  );

  if (!settings.enabled || reducedMotion) {
    return {
      state: {
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        zoom: 1,
      },
      progress: 0,
      perspective,
      driftOffset: { x: 0, y: 0 },
      shakeOffset: { x: 0, y: 0 },
    };
  }

  const totalFrames = getSequenceDurationInFrames(sequence);
  const animFrames = Math.max(1, Math.round(totalFrames * (settings.durationRatio ?? 1)));
  const rawProgress = Math.min(1, frame / animFrames);
  const easingFn = getEasingFunctionById(settings.motion?.easingId);
  const progress = easingFn(rawProgress);

  const start = settings.motion?.start ?? {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    zoom: 1,
  };
  const end = settings.motion?.end ?? start;

  let state = lerpCameraState(start, end, progress);

  if (settings.presetId === "focus-shift") {
    const focusOffset = resolveFocusShiftOffset(
      sequence,
      progress,
      settings.depthOfField?.focusTargetBlockId,
    );
    state = {
      ...state,
      position: {
        x: state.position.x + focusOffset.x,
        y: state.position.y + focusOffset.y,
        z: state.position.z + focusOffset.z,
      },
    };
  }

  const userZoom = settings.zoom ?? 1;
  state = { ...state, zoom: state.zoom * userZoom };

  if (settings.position) {
    state.position.x += settings.position.x;
    state.position.y += settings.position.y;
    state.position.z += settings.position.z;
  }
  if (settings.rotation) {
    state.rotation.x += settings.rotation.x;
    state.rotation.y += settings.rotation.y;
    state.rotation.z += settings.rotation.z;
  }

  const drift = (settings.motion?.drift ?? 0) / 100;
  const driftOffset = {
    x: Math.sin(frame * 0.02) * drift * 8,
    y: Math.cos(frame * 0.015) * drift * 6,
  };

  const shake = (settings.motion?.shake ?? 0) / 100;
  const shakeOffset = {
    x: (Math.random() - 0.5) * shake * 6,
    y: (Math.random() - 0.5) * shake * 6,
  };

  return {
    state,
    progress,
    perspective,
    driftOffset,
    shakeOffset,
  };
}

export function buildCameraSceneStyles(
  camera: CameraSettings | undefined,
  sequence: MotionSequence,
  frame: number,
  reducedMotion = false,
): { container: CSSProperties; inner: CSSProperties } {
  const { state, perspective, driftOffset, shakeOffset } = resolveCameraStateAtFrame(
    camera,
    sequence,
    frame,
    reducedMotion,
  );

  const { position, rotation, zoom } = state;
  const tx = position.x + driftOffset.x + shakeOffset.x;
  const ty = position.y + driftOffset.y + shakeOffset.y;
  const tz = position.z;

  return {
    container: {
      perspective: `${perspective}px`,
      perspectiveOrigin: "50% 50%",
      overflow: "hidden",
    },
    inner: {
      width: "100%",
      height: "100%",
      transformStyle: "preserve-3d",
      transform: `translate3d(${tx}px, ${ty}px, ${tz}px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg) scale(${zoom})`,
      willChange: "transform",
    },
  };
}

export function buildBlock3DStyles(
  block3D: Block3DSettings | undefined,
  camera: CameraSettings | undefined,
  sequence: MotionSequence,
  frame: number,
  blockIndex: number,
  renderMode: CameraRenderMode,
  reducedMotion = false,
): CSSProperties {
  const settings = normalizeBlock3DSettings(block3D);
  const cameraSettings = normalizeCameraSettings(camera);

  if (!settings?.enabled || settings.depthMode === "flat") {
    return buildDepthBlurOnly(cameraSettings, settings, blockIndex, sequence, frame, reducedMotion, renderMode);
  }

  const { progress } = resolveCameraStateAtFrame(camera, sequence, frame, reducedMotion);
  const parallaxDirection = cameraSettings.presetId === "parallax-sweep" ? 1 : 0.5;
  const parallaxX = progress * settings.parallaxAmount * 50 * parallaxDirection * (blockIndex % 2 === 0 ? 1 : -0.7);
  const parallaxY = progress * settings.parallaxAmount * 15 * (blockIndex % 3 === 0 ? 1 : -0.5);

  const faceCamera = settings.faceCamera
    ? ` rotateY(${-resolveCameraStateAtFrame(camera, sequence, frame, reducedMotion).state.rotation.y}deg)`
    : "";

  const shadow =
    settings.ambientShadow && renderMode === "export"
      ? ` drop-shadow(0 ${8 + settings.shadowSoftness * 0.1}px ${settings.shadowSoftness * 0.3}px rgba(0,0,0,0.25))`
      : settings.ambientShadow
        ? ` drop-shadow(0 4px ${settings.shadowSoftness * 0.15}px rgba(0,0,0,0.15))`
        : "";

  const blur = resolveBlockDepthBlur(
    cameraSettings,
    settings,
    blockIndex,
    sequence,
    frame,
    reducedMotion,
    renderMode,
  );

  return {
    transformStyle: "preserve-3d" as const,
    transform: `translate3d(${parallaxX}px, ${parallaxY}px, ${settings.z}px) rotateX(${settings.rotateX}deg) rotateY(${settings.rotateY}deg) rotateZ(${settings.rotateZ}deg)${faceCamera}`,
    filter: `${shadow}${blur}`.trim() || undefined,
    willChange: "transform, filter",
  };
}

function buildDepthBlurOnly(
  cameraSettings: ReturnType<typeof normalizeCameraSettings>,
  block3D: Block3DSettings | undefined,
  blockIndex: number,
  sequence: MotionSequence,
  frame: number,
  reducedMotion: boolean,
  renderMode: CameraRenderMode,
): CSSProperties {
  const blur = resolveBlockDepthBlur(
    cameraSettings,
    block3D,
    blockIndex,
    sequence,
    frame,
    reducedMotion,
    renderMode,
  );
  return blur ? { filter: blur } : {};
}

function resolveBlockDepthBlur(
  cameraSettings: ReturnType<typeof normalizeCameraSettings>,
  block3D: Block3DSettings | undefined,
  blockIndex: number,
  sequence: MotionSequence,
  _frame: number,
  reducedMotion: boolean,
  renderMode: CameraRenderMode,
): string {
  if (!cameraSettings.depthOfField?.enabled || reducedMotion) return "";

  const focusBlocks = getFocusTargetBlocks(sequence.blocks);
  const focusId =
    cameraSettings.depthOfField.focusTargetBlockId ??
    focusBlocks[0]?.id;

  const focusIndex = focusBlocks.findIndex((block) => block.id === focusId);
  const currentBlock = sequence.blocks[blockIndex];
  const isFocused = currentBlock?.id === focusId;

  if (isFocused || focusIndex < 0) return "";

  const blurAmount = cameraSettings.depthOfField.blurAmount ?? 30;
  const influence = block3D?.depthBlurInfluence ?? 0.5;
  const qualityScale = renderMode === "export" ? 1 : 0.6;
  const px = (blurAmount / 100) * influence * 8 * qualityScale;

  if (px < 0.3) return "";
  return `blur(${px.toFixed(1)}px)`;
}
