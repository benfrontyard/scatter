import type { MotionAspectRatio } from "@/types/motion-block-library";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type StudioWorkbenchControls = {
  blockName: string | null;
  blockStatus: string | null;
  aspectRatio: MotionAspectRatio;
  setAspectRatio: (value: MotionAspectRatio) => void;
  brandId: string;
  setBrandId: (value: string) => void;
  brandName: string;
  showPreviewSettings: boolean;
  setShowPreviewSettings: (value: boolean) => void;
  onCopyPatch: () => void;
  onExportJson: () => void;
};

type StudioWorkbenchContextValue = {
  controls: StudioWorkbenchControls | null;
  setControls: (controls: StudioWorkbenchControls | null) => void;
};

const StudioWorkbenchContext = createContext<StudioWorkbenchContextValue | null>(null);

export function StudioWorkbenchProvider({ children }: { children: ReactNode }) {
  const [controls, setControls] = useState<StudioWorkbenchControls | null>(null);
  const value = useMemo(() => ({ controls, setControls }), [controls]);
  return (
    <StudioWorkbenchContext.Provider value={value}>{children}</StudioWorkbenchContext.Provider>
  );
}

export function useStudioWorkbench() {
  const ctx = useContext(StudioWorkbenchContext);
  if (!ctx) {
    throw new Error("useStudioWorkbench must be used within StudioWorkbenchProvider");
  }
  return ctx;
}
