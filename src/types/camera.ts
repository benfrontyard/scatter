export type LensPreset = "wide" | "natural" | "portrait" | "telephoto" | "macro";

export type FocalLength = 24 | 35 | 50 | 85 | 100;

export type DepthMode = "flat" | "subtle" | "strong";

export type CameraState = {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  zoom: number;
};

export type CameraKeyframe = {
  frame: number;
  state: CameraState;
};

export type CameraDepthOfField = {
  enabled: boolean;
  focusTargetBlockId?: string;
  focusDistance?: number;
  aperture?: number;
  blurAmount?: number;
  transitionSpeed?: number;
};

export type CameraMotion = {
  start?: CameraState;
  end?: CameraState;
  keyframes?: CameraKeyframe[];
  easing?: string;
  easingId?: string;
  drift?: number;
  shake?: number;
};

export type CameraSettings = {
  enabled: boolean;
  presetId?: string;
  lensPreset?: LensPreset;
  focalLength?: FocalLength;
  perspectiveStrength?: number;
  zoom?: number;
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  depthOfField?: CameraDepthOfField;
  motion?: CameraMotion;
  /** 0–1 ratio of sequence duration used for camera animation */
  durationRatio?: number;
};

export type Block3DSettings = {
  enabled: boolean;
  depthMode: DepthMode;
  z: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  parallaxAmount: number;
  faceCamera: boolean;
  canBeFocusTarget: boolean;
  ambientShadow: boolean;
  shadowSoftness: number;
  depthBlurInfluence: number;
};

export type CameraRenderMode = "preview" | "export";

export type CameraPreset = {
  id: string;
  name: string;
  description: string;
  /** CSS gradient for preset card thumbnail */
  previewGradient: string;
  settings: Partial<CameraSettings>;
};
