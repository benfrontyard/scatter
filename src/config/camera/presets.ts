import type { CameraMotion, CameraPreset, CameraSettings, CameraState } from "@/types/camera";

export const defaultCameraSettings: CameraSettings = {
  enabled: false,
  presetId: undefined,
  lensPreset: "natural",
  focalLength: 50,
  perspectiveStrength: 50,
  zoom: 1,
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  depthOfField: {
    enabled: false,
    focusDistance: 50,
    aperture: 50,
    blurAmount: 30,
    transitionSpeed: 50,
  },
  motion: {
    easingId: "ease-in-out",
    drift: 0,
    shake: 0,
  },
  durationRatio: 1,
};

const baseMotion = (
  start: CameraState,
  end: CameraState,
  extras?: Partial<CameraMotion>,
): CameraMotion => ({
  start,
  end,
  easingId: "ease-in-out",
  drift: 0,
  shake: 0,
  ...extras,
});

export const cameraPresets: CameraPreset[] = [
  {
    id: "slow-push-in",
    name: "Slow Push In",
    description: "Gently moves closer to the selected content.",
    previewGradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    settings: {
      enabled: true,
      presetId: "slow-push-in",
      lensPreset: "natural",
      focalLength: 50,
      zoom: 1,
      motion: baseMotion(
        { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, zoom: 1 },
        { position: { x: 0, y: 0, z: -90 }, rotation: { x: 0, y: 0, z: 0 }, zoom: 1.06 },
        { drift: 8 },
      ),
      durationRatio: 1,
    },
  },
  {
    id: "pull-back-reveal",
    name: "Pull Back Reveal",
    description: "Starts close and pulls back to reveal the full composition.",
    previewGradient: "linear-gradient(135deg, #2d1b69 0%, #11998e 100%)",
    settings: {
      enabled: true,
      presetId: "pull-back-reveal",
      lensPreset: "wide",
      focalLength: 35,
      zoom: 1.12,
      motion: baseMotion(
        { position: { x: 0, y: 0, z: -70 }, rotation: { x: 2, y: 0, z: 0 }, zoom: 1.12 },
        { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, zoom: 1 },
      ),
      durationRatio: 1,
    },
  },
  {
    id: "focus-shift",
    name: "Focus Shift",
    description: "Moves attention from one block to another with depth.",
    previewGradient: "linear-gradient(135deg, #0c0c0c 0%, #434343 50%, #1a1a2e 100%)",
    settings: {
      enabled: true,
      presetId: "focus-shift",
      lensPreset: "portrait",
      focalLength: 85,
      zoom: 1,
      depthOfField: {
        enabled: true,
        blurAmount: 40,
        aperture: 55,
        focusDistance: 50,
        transitionSpeed: 60,
      },
      motion: baseMotion(
        { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, zoom: 1 },
        { position: { x: 0, y: 0, z: -50 }, rotation: { x: 0, y: 0, z: 0 }, zoom: 1.04 },
        { easingId: "ease-in-out" },
      ),
      durationRatio: 1,
    },
  },
  {
    id: "orbit-subtle",
    name: "Orbit Subtle",
    description: "Adds a slight cinematic angle around the composition.",
    previewGradient: "linear-gradient(135deg, #141e30 0%, #243b55 100%)",
    settings: {
      enabled: true,
      presetId: "orbit-subtle",
      lensPreset: "natural",
      focalLength: 50,
      zoom: 1,
      motion: baseMotion(
        { position: { x: 0, y: 0, z: -20 }, rotation: { x: 1.5, y: -3, z: 0 }, zoom: 1 },
        { position: { x: 0, y: 0, z: -20 }, rotation: { x: -1.5, y: 3, z: 0 }, zoom: 1 },
        { drift: 5 },
      ),
      durationRatio: 1,
    },
  },
  {
    id: "parallax-sweep",
    name: "Parallax Sweep",
    description: "Sweeps across the scene with layered depth movement.",
    previewGradient: "linear-gradient(135deg, #000428 0%, #004e92 100%)",
    settings: {
      enabled: true,
      presetId: "parallax-sweep",
      lensPreset: "wide",
      focalLength: 24,
      zoom: 1,
      motion: baseMotion(
        { position: { x: -35, y: 0, z: 0 }, rotation: { x: 0, y: 2, z: 0 }, zoom: 1 },
        { position: { x: 35, y: 0, z: 0 }, rotation: { x: 0, y: -2, z: 0 }, zoom: 1 },
      ),
      durationRatio: 1,
    },
  },
];

export const cameraPresetMap = Object.fromEntries(
  cameraPresets.map((preset) => [preset.id, preset]),
) as Record<string, CameraPreset>;
