import { cameraPresetMap, defaultCameraSettings } from "@/config/camera/presets";
import type {
  Block3DSettings,
  CameraSettings,
  CameraState,
  DepthMode,
  FocalLength,
  LensPreset,
} from "@/types/camera";

export { defaultCameraSettings } from "@/config/camera/presets";

const LENS_FOCAL_LENGTHS: Record<LensPreset, FocalLength> = {
  wide: 24,
  natural: 50,
  portrait: 85,
  telephoto: 100,
  macro: 100,
};

const DEPTH_MODE_DEFAULTS: Record<
  DepthMode,
  Pick<Block3DSettings, "z" | "parallaxAmount" | "depthBlurInfluence" | "ambientShadow" | "shadowSoftness">
> = {
  flat: { z: 0, parallaxAmount: 0, depthBlurInfluence: 0, ambientShadow: false, shadowSoftness: 0 },
  subtle: { z: 25, parallaxAmount: 0.35, depthBlurInfluence: 0.4, ambientShadow: true, shadowSoftness: 30 },
  strong: { z: 65, parallaxAmount: 0.75, depthBlurInfluence: 0.7, ambientShadow: true, shadowSoftness: 50 },
};

export function getDepthModeDefaults(depthMode: DepthMode) {
  return DEPTH_MODE_DEFAULTS[depthMode];
}

export function defaultBlock3DSettings(depthMode: DepthMode = "flat"): Block3DSettings {
  const defaults = getDepthModeDefaults(depthMode);
  return {
    enabled: depthMode !== "flat",
    depthMode,
    z: defaults.z,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    parallaxAmount: defaults.parallaxAmount,
    faceCamera: false,
    canBeFocusTarget: true,
    ambientShadow: defaults.ambientShadow,
    shadowSoftness: defaults.shadowSoftness,
    depthBlurInfluence: defaults.depthBlurInfluence,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeCameraState(
  state: Partial<CameraState> | undefined,
  fallback: CameraState,
): CameraState {
  return {
    position: {
      x: state?.position?.x ?? fallback.position.x,
      y: state?.position?.y ?? fallback.position.y,
      z: state?.position?.z ?? fallback.position.z,
    },
    rotation: {
      x: state?.rotation?.x ?? fallback.rotation.x,
      y: state?.rotation?.y ?? fallback.rotation.y,
      z: state?.rotation?.z ?? fallback.rotation.z,
    },
    zoom: state?.zoom ?? fallback.zoom,
  };
}

const DEFAULT_STATE: CameraState = {
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  zoom: 1,
};

export function normalizeCameraSettings(camera: CameraSettings | undefined): CameraSettings {
  if (!camera) return structuredClone(defaultCameraSettings);

  const lensPreset: LensPreset = ["wide", "natural", "portrait", "telephoto", "macro"].includes(
    camera.lensPreset ?? "",
  )
    ? (camera.lensPreset as LensPreset)
    : "natural";

  const focalLengths: FocalLength[] = [24, 35, 50, 85, 100];
  const focalLength: FocalLength = focalLengths.includes(camera.focalLength as FocalLength)
    ? (camera.focalLength as FocalLength)
    : LENS_FOCAL_LENGTHS[lensPreset];

  return {
    enabled: Boolean(camera.enabled),
    presetId: camera.presetId,
    lensPreset,
    focalLength,
    perspectiveStrength: clamp(camera.perspectiveStrength ?? 50, 0, 100),
    zoom: clamp(camera.zoom ?? 1, 0.5, 2),
    position: {
      x: camera.position?.x ?? 0,
      y: camera.position?.y ?? 0,
      z: camera.position?.z ?? 0,
    },
    rotation: {
      x: camera.rotation?.x ?? 0,
      y: camera.rotation?.y ?? 0,
      z: camera.rotation?.z ?? 0,
    },
    depthOfField: {
      enabled: Boolean(camera.depthOfField?.enabled),
      focusTargetBlockId: camera.depthOfField?.focusTargetBlockId,
      focusDistance: clamp(camera.depthOfField?.focusDistance ?? 50, 0, 100),
      aperture: clamp(camera.depthOfField?.aperture ?? 50, 0, 100),
      blurAmount: clamp(camera.depthOfField?.blurAmount ?? 30, 0, 100),
      transitionSpeed: clamp(camera.depthOfField?.transitionSpeed ?? 50, 0, 100),
    },
    motion: {
      start: normalizeCameraState(camera.motion?.start, DEFAULT_STATE),
      end: normalizeCameraState(camera.motion?.end, DEFAULT_STATE),
      keyframes: camera.motion?.keyframes,
      easing: camera.motion?.easing,
      easingId: camera.motion?.easingId ?? "ease-in-out",
      drift: clamp(camera.motion?.drift ?? 0, 0, 100),
      shake: clamp(camera.motion?.shake ?? 0, 0, 100),
    },
    durationRatio: clamp(camera.durationRatio ?? 1, 0.1, 1),
  };
}

export function normalizeBlock3DSettings(
  block3D: Block3DSettings | undefined,
): Block3DSettings | undefined {
  if (!block3D) return undefined;

  const depthMode: DepthMode = ["flat", "subtle", "strong"].includes(block3D.depthMode)
    ? block3D.depthMode
    : "flat";

  const modeDefaults = getDepthModeDefaults(depthMode);

  return {
    enabled: block3D.enabled ?? depthMode !== "flat",
    depthMode,
    z: block3D.z ?? modeDefaults.z,
    rotateX: block3D.rotateX ?? 0,
    rotateY: block3D.rotateY ?? 0,
    rotateZ: block3D.rotateZ ?? 0,
    parallaxAmount: block3D.parallaxAmount ?? modeDefaults.parallaxAmount,
    faceCamera: Boolean(block3D.faceCamera),
    canBeFocusTarget: block3D.canBeFocusTarget !== false,
    ambientShadow: block3D.ambientShadow ?? modeDefaults.ambientShadow,
    shadowSoftness: block3D.shadowSoftness ?? modeDefaults.shadowSoftness,
    depthBlurInfluence: block3D.depthBlurInfluence ?? modeDefaults.depthBlurInfluence,
  };
}

export function applyCameraPreset(presetId: string): CameraSettings {
  const preset = cameraPresetMap[presetId];
  if (!preset) return structuredClone(defaultCameraSettings);

  return normalizeCameraSettings({
    ...structuredClone(defaultCameraSettings),
    ...structuredClone(preset.settings),
    presetId,
    enabled: true,
  });
}

export function focusCameraOnBlock(
  camera: CameraSettings,
  blockId: string,
): CameraSettings {
  if (!blockId) {
    const dof = camera.depthOfField ?? defaultCameraSettings.depthOfField!;
    return normalizeCameraSettings({
      ...camera,
      depthOfField: {
        ...dof,
        focusTargetBlockId: undefined,
      },
    });
  }

  const dof = camera.depthOfField ?? defaultCameraSettings.depthOfField!;
  return normalizeCameraSettings({
    ...camera,
    enabled: true,
    depthOfField: {
      ...dof,
      enabled: dof.enabled || camera.presetId === "focus-shift",
      focusTargetBlockId: blockId,
    },
  });
}

export function updateBlock3DDepthMode(
  block3D: Block3DSettings | undefined,
  depthMode: DepthMode,
): Block3DSettings {
  const defaults = defaultBlock3DSettings(depthMode);
  if (!block3D) return defaults;

  return normalizeBlock3DSettings({
    ...block3D,
    ...defaults,
    depthMode,
    enabled: depthMode !== "flat",
  })!;
}

export function getLensPerspective(
  lensPreset: LensPreset,
  focalLength: FocalLength,
  perspectiveStrength: number,
): number {
  const baseByLens: Record<LensPreset, number> = {
    wide: 1400,
    natural: 900,
    portrait: 650,
    telephoto: 450,
    macro: 320,
  };

  const baseByFocal: Record<FocalLength, number> = {
    24: 1400,
    35: 1100,
    50: 900,
    85: 650,
    100: 450,
  };

  const base = (baseByLens[lensPreset] + baseByFocal[focalLength]) / 2;
  const strengthFactor = 0.5 + perspectiveStrength / 100;
  return Math.round(base * strengthFactor);
}

export function lerpCameraState(a: CameraState, b: CameraState, t: number): CameraState {
  const lerp = (from: number, to: number) => from + (to - from) * t;
  return {
    position: {
      x: lerp(a.position.x, b.position.x),
      y: lerp(a.position.y, b.position.y),
      z: lerp(a.position.z, b.position.z),
    },
    rotation: {
      x: lerp(a.rotation.x, b.rotation.x),
      y: lerp(a.rotation.y, b.rotation.y),
      z: lerp(a.rotation.z, b.rotation.z),
    },
    zoom: lerp(a.zoom, b.zoom),
  };
}
