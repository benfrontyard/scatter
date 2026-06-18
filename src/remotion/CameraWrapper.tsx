import { buildCameraSceneStyles, buildBlock3DStyles } from "@/motion/camera";
import { normalizeCameraSettings } from "@/lib/camera";
import type { CameraRenderMode, MotionSequence } from "@/types";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { ReactNode } from "react";

type CameraWrapperProps = {
  sequence: MotionSequence;
  renderMode: CameraRenderMode;
  reducedMotion?: boolean;
  children: ReactNode;
};

export function CameraWrapper({
  sequence,
  reducedMotion = false,
  children,
}: CameraWrapperProps) {
  const frame = useCurrentFrame();
  const camera = normalizeCameraSettings(sequence.camera);

  if (!camera.enabled) {
    return <AbsoluteFill>{children}</AbsoluteFill>;
  }

  const sceneStyles = buildCameraSceneStyles(camera, sequence, frame, reducedMotion);

  return (
    <AbsoluteFill style={sceneStyles.container}>
      <AbsoluteFill style={sceneStyles.inner}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
}

type Block3DWrapperProps = {
  blockIndex: number;
  sequence: MotionSequence;
  renderMode: CameraRenderMode;
  reducedMotion?: boolean;
  children: ReactNode;
};

export function Block3DWrapper({
  blockIndex,
  sequence,
  renderMode,
  reducedMotion = false,
  children,
}: Block3DWrapperProps) {
  const frame = useCurrentFrame();
  const block = sequence.blocks[blockIndex];
  const camera = normalizeCameraSettings(sequence.camera);

  const blockStyles = buildBlock3DStyles(
    block?.block3D,
    camera,
    sequence,
    frame,
    blockIndex,
    renderMode,
    reducedMotion,
  );

  const has3D = Object.keys(blockStyles).length > 0;

  if (!has3D && !camera.enabled) {
    return <>{children}</>;
  }

  return (
    <AbsoluteFill
      style={{
        ...blockStyles,
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </AbsoluteFill>
  );
}
