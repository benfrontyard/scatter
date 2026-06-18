import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { defaultMotionSequence } from "@/config/sequences/default";
import { motionFormats } from "@/config/formats";
import { addBlockToSequence, removeBlockFromSequence } from "@/lib/sequence-utils";
import {
  createEmptyCustomBrand,
  duplicateBrandAsCustom,
  getAllBrands,
  resolveBrand,
  CUSTOM_BRAND_ID,
} from "@/lib/brand-utils";
import { createSnapshot, snapshotsEqual, type EditorSnapshot } from "@/lib/editor-snapshot";
import type { ScatterProject } from "@/types";
import {
  createNewProject,
  loadProject,
  saveProject,
  snapshotProject,
} from "@/lib/project-storage";
import { useHistory } from "@/hooks/use-history";
import type {
  BlockTransition,
  BlockTypographyOverride,
  BrandPreset,
  EffectInstance,
  TextAnimationInstance,
  MotionBlockInstance,
  MotionSequence,
  PostFXSettings,
  ProjectAsset,
  CameraSettings,
  Block3DSettings,
} from "@/types";
import { EDITOR_FPS, type EditorStep } from "@/types/editor";
import { normalizePostFXSettings } from "@/lib/post-fx";
import {
  applyCameraPreset as buildCameraPreset,
  focusCameraOnBlock as setCameraFocus,
  normalizeCameraSettings,
} from "@/lib/camera";
import type { PlayerRef } from "@remotion/player";

type SettingsPanelView = "project" | "postFx" | "camera";

export type EditorToastState = {
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
};

type EditorActions = {
  setStep: (step: EditorStep) => void;
  setBrand: (brandPresetId: string) => void;
  setFormat: (formatId: string) => void;
  setCanvasBackground: (color: string) => void;
  setProjectName: (name: string) => void;
  setFps: (fps: number) => void;
  setLogoText: (text: string) => void;
  setSettingsPanelView: (view: SettingsPanelView) => void;
  updatePostFX: (postFx: PostFXSettings) => void;
  applyPostFXPreset: (postFx: PostFXSettings) => void;
  updateCamera: (camera: CameraSettings) => void;
  applyCameraPreset: (presetId: string) => void;
  focusCameraOnBlock: (blockId: string) => void;
  focusCameraOnSelectedBlock: () => void;
  updateBlock3D: (blockId: string, block3D: Block3DSettings | undefined) => void;
  updateBlockTypographyOverride: (
    blockId: string,
    override: BlockTypographyOverride | undefined,
  ) => void;
  updateBlockEffects: (blockId: string, effects: EffectInstance[] | undefined) => void;
  updateBlockTextAnimations: (
    blockId: string,
    animations: TextAnimationInstance[] | undefined,
  ) => void;
  selectBlock: (blockId: string | null) => void;
  selectTransition: (transitionId: string | null) => void;
  clearSelection: () => void;
  addBlock: (blockId: string) => void;
  deleteBlock: (blockId: string) => void;
  deleteSelectedBlock: () => void;
  deleteSelectedTransition: () => void;
  updateBlock: (blockId: string, updater: (block: MotionBlockInstance) => MotionBlockInstance) => void;
  updateBlockDuration: (blockId: string, duration: number) => void;
  updateBlockContent: (blockId: string, key: string, value: string) => void;
  updateBlockMotion: (blockId: string, key: string, value: number | string) => void;
  updateBlockEasing: (blockId: string, easingId: string | undefined) => void;
  updateTransition: (
    transitionId: string,
    updater: (transition: BlockTransition) => BlockTransition,
  ) => void;
  updateTransitionDuration: (transitionId: string, duration: number) => void;
  updateCustomBrand: (updater: (brand: BrandPreset) => BrandPreset) => void;
  commitBrandDraft: (brand: BrandPreset, logoText: string) => void;
  duplicateBrandToCustom: (sourceBrandId: string) => void;
  saveCustomBrand: () => void;
  addAsset: (file: File) => Promise<ProjectAsset | null>;
  removeAsset: (assetId: string) => void;
  replaceBlockAsset: (blockId: string, contentKey: string, assetId: string) => void;
  undo: () => void;
  redo: () => void;
  saveProject: () => void;
  newProject: (force?: boolean) => boolean;
  loadProjectById: (id: string) => void;
  importProject: (project: ScatterProject) => void;
  setCurrentFrame: (frame: number) => void;
  seekToFrame: (frame: number) => void;
  togglePlayback: () => void;
  setIsPlaying: (playing: boolean) => void;
  registerPlayer: (player: PlayerRef | null) => void;
  nudgePlayhead: (deltaFrames: number) => void;
  showToast: (toast: EditorToastState) => void;
  dismissToast: () => void;
};

type EditorContextValue = {
  step: EditorStep;
  sequence: MotionSequence;
  selectedBlockId: string | null;
  selectedTransitionId: string | null;
  brand: BrandPreset;
  allBrands: BrandPreset[];
  customBrands: BrandPreset[];
  format: (typeof motionFormats)[number];
  fps: number;
  assets: ProjectAsset[];
  projectId: string;
  isDirty: boolean;
  canUndo: boolean;
  canRedo: boolean;
  currentFrame: number;
  isPlaying: boolean;
  showShortcuts: boolean;
  setShowShortcuts: (show: boolean) => void;
  showBrandSystem: boolean;
  setShowBrandSystem: (show: boolean) => void;
  showProjectMenu: boolean;
  setShowProjectMenu: (show: boolean) => void;
  settingsPanelView: SettingsPanelView;
  postFx: PostFXSettings;
  camera: CameraSettings;
  toast: EditorToastState | null;
} & EditorActions;

const EditorContext = createContext<EditorContextValue | null>(null);

function readAssetAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export function EditorProvider({ children }: { children: ReactNode }) {
  const initialProject = useMemo(() => createNewProject(defaultMotionSequence.name), []);
  const savedSnapshotRef = useRef<EditorSnapshot>(
    createSnapshot(initialProject.sequence, initialProject.customBrands, initialProject.assets),
  );

  const [projectId, setProjectId] = useState(initialProject.id);
  const [step, setStep] = useState<EditorStep>("motion");
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [selectedTransitionId, setSelectedTransitionId] = useState<string | null>(null);
  const [currentFrame, setCurrentFrameState] = useState(0);
  const [isPlaying, setIsPlayingState] = useState(true);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showBrandSystem, setShowBrandSystem] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [settingsPanelView, setSettingsPanelView] = useState<SettingsPanelView>("project");
  const [toast, setToast] = useState<EditorToastState | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  const playerRef = useRef<PlayerRef | null>(null);

  const history = useHistory<EditorSnapshot>(
    createSnapshot(initialProject.sequence, initialProject.customBrands, initialProject.assets),
  );

  const { sequence, customBrands, assets } = history.present;
  const brand = resolveBrand(sequence.brandPresetId, customBrands);
  const allBrands = getAllBrands(customBrands);
  const format = motionFormats.find((item) => item.id === sequence.format) ?? motionFormats[0];
  const fps = sequence.fps ?? EDITOR_FPS;
  const postFx = normalizePostFXSettings(sequence.postFx);
  const camera = normalizeCameraSettings(sequence.camera);

  const isDirty = !snapshotsEqual(history.present, savedSnapshotRef.current);

  const updateSnapshot = useCallback(
    (updater: (snapshot: EditorSnapshot) => EditorSnapshot) => {
      history.set((prev) => updater(prev));
    },
    [history],
  );

  const loadSnapshot = useCallback(
    (snapshot: EditorSnapshot, newProjectId?: string) => {
      history.reset(snapshot);
      savedSnapshotRef.current = createSnapshot(
        snapshot.sequence,
        snapshot.customBrands,
        snapshot.assets,
      );
      if (newProjectId) setProjectId(newProjectId);
      setSelectedBlockId(null);
      setSelectedTransitionId(null);
      setCurrentFrameState(0);
      playerRef.current?.seekTo(0);
    },
    [history],
  );

  const setCurrentFrame = useCallback((frame: number) => {
    setCurrentFrameState(frame);
  }, []);

  const seekToFrame = useCallback((frame: number) => {
    const clamped = Math.max(0, frame);
    setCurrentFrameState(clamped);
    playerRef.current?.seekTo(clamped);
  }, []);

  const togglePlayback = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
    setIsPlayingState((prev) => !prev);
  }, [isPlaying]);

  const setIsPlaying = useCallback((playing: boolean) => {
    setIsPlayingState(playing);
  }, []);

  const registerPlayer = useCallback((player: PlayerRef | null) => {
    playerRef.current = player;
  }, []);

  const nudgePlayhead = useCallback(
    (deltaFrames: number) => {
      seekToFrame(currentFrame + deltaFrames);
    },
    [currentFrame, seekToFrame],
  );

  const dismissToast = useCallback(() => {
    if (toastTimeoutRef.current !== null) {
      window.clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
    setToast(null);
  }, []);

  const showToast = useCallback(
    (next: EditorToastState) => {
      if (toastTimeoutRef.current !== null) {
        window.clearTimeout(toastTimeoutRef.current);
      }
      setToast(next);
      toastTimeoutRef.current = window.setTimeout(() => {
        setToast(null);
        toastTimeoutRef.current = null;
      }, 5000);
    },
    [],
  );

  const value = useMemo<EditorContextValue>(
    () => ({
      step,
      sequence,
      selectedBlockId,
      selectedTransitionId,
      brand,
      allBrands,
      customBrands,
      format,
      fps,
      assets,
      projectId,
      isDirty,
      canUndo: history.canUndo,
      canRedo: history.canRedo,
      currentFrame,
      isPlaying,
      showShortcuts,
      setShowShortcuts,
      showBrandSystem,
      setShowBrandSystem,
      showProjectMenu,
      setShowProjectMenu,
      settingsPanelView,
      postFx,
      camera,
      toast,
      setSettingsPanelView,
      setStep,
      setBrand: (brandPresetId) => {
        updateSnapshot((prev) => ({
          ...prev,
          sequence: { ...prev.sequence, brandPresetId },
        }));
      },
      setFormat: (formatId) => {
        updateSnapshot((prev) => ({
          ...prev,
          sequence: { ...prev.sequence, format: formatId },
        }));
      },
      setCanvasBackground: (color) => {
        updateSnapshot((prev) => ({
          ...prev,
          sequence: { ...prev.sequence, canvasBackground: color },
        }));
      },
      setProjectName: (name) => {
        updateSnapshot((prev) => ({
          ...prev,
          sequence: { ...prev.sequence, name },
        }));
      },
      setFps: (nextFps) => {
        updateSnapshot((prev) => ({
          ...prev,
          sequence: { ...prev.sequence, fps: nextFps },
        }));
      },
      updateBlockTypographyOverride: (blockId, override) => {
        updateSnapshot((prev) => ({
          ...prev,
          sequence: {
            ...prev.sequence,
            blocks: prev.sequence.blocks.map((block) =>
              block.id === blockId
                ? {
                    ...block,
                    typographyOverride: override,
                  }
                : block,
            ),
          },
        }));
      },

      updateBlockEffects: (blockId, effects) => {
        updateSnapshot((prev) => ({
          ...prev,
          sequence: {
            ...prev.sequence,
            blocks: prev.sequence.blocks.map((block) =>
              block.id === blockId
                ? {
                    ...block,
                    effects,
                  }
                : block,
            ),
          },
        }));
      },
      updateBlockTextAnimations: (blockId, textAnimations) => {
        updateSnapshot((prev) => ({
          ...prev,
          sequence: {
            ...prev.sequence,
            blocks: prev.sequence.blocks.map((block) =>
              block.id === blockId
                ? {
                    ...block,
                    textAnimations,
                  }
                : block,
            ),
          },
        }));
      },
      setLogoText: (text) => {
        updateSnapshot((prev) => ({
          ...prev,
          sequence: { ...prev.sequence, logoText: text },
        }));
      },
      updatePostFX: (nextPostFx) => {
        updateSnapshot((prev) => ({
          ...prev,
          sequence: { ...prev.sequence, postFx: normalizePostFXSettings(nextPostFx) },
        }));
      },
      applyPostFXPreset: (nextPostFx) => {
        const normalized = normalizePostFXSettings(structuredClone(nextPostFx));
        updateSnapshot((prev) => ({
          ...prev,
          sequence: {
            ...prev.sequence,
            postFx: {
              ...normalized,
              effects: normalized.effects.map((effect) => ({
                ...effect,
                id: `${effect.type}-${crypto.randomUUID().slice(0, 8)}`,
              })),
            },
          },
        }));
      },
      updateCamera: (nextCamera) => {
        updateSnapshot((prev) => ({
          ...prev,
          sequence: {
            ...prev.sequence,
            camera: normalizeCameraSettings(nextCamera),
          },
        }));
      },
      applyCameraPreset: (presetId) => {
        updateSnapshot((prev) => ({
          ...prev,
          sequence: {
            ...prev.sequence,
            camera: buildCameraPreset(presetId),
          },
        }));
      },
      focusCameraOnBlock: (blockId) => {
        updateSnapshot((prev) => ({
          ...prev,
          sequence: {
            ...prev.sequence,
            camera: setCameraFocus(
              normalizeCameraSettings(prev.sequence.camera),
              blockId,
            ),
          },
        }));
      },
      focusCameraOnSelectedBlock: () => {
        if (!selectedBlockId) return;
        updateSnapshot((prev) => ({
          ...prev,
          sequence: {
            ...prev.sequence,
            camera: setCameraFocus(
              normalizeCameraSettings({
                ...normalizeCameraSettings(prev.sequence.camera),
                enabled: true,
              }),
              selectedBlockId,
            ),
          },
        }));
        setSettingsPanelView("camera");
      },
      updateBlock3D: (blockId, block3D) => {
        updateSnapshot((prev) => ({
          ...prev,
          sequence: {
            ...prev.sequence,
            blocks: prev.sequence.blocks.map((block) =>
              block.id === blockId ? { ...block, block3D } : block,
            ),
          },
        }));
      },
      selectBlock: (blockId) => {
        setSelectedBlockId(blockId);
        if (blockId) {
          setSelectedTransitionId(null);
          setStep("motion");
        }
      },
      selectTransition: (transitionId) => {
        setSelectedTransitionId(transitionId);
        if (transitionId) {
          setSelectedBlockId(null);
          setStep("motion");
        }
      },
      clearSelection: () => {
        setSelectedBlockId(null);
        setSelectedTransitionId(null);
      },
      addBlock: (blockId) => {
        let newBlockId: string | null = null;
        updateSnapshot((prev) => {
          const result = addBlockToSequence(prev.sequence, blockId);
          newBlockId = result.newBlockId;
          return { ...prev, sequence: result.sequence };
        });
        setSelectedBlockId(newBlockId);
        setSelectedTransitionId(null);
      },
      deleteBlock: (blockId) => {
        let nextSelectedId: string | null = selectedBlockId;
        updateSnapshot((prev) => {
          const next = removeBlockFromSequence(prev.sequence, blockId);
          if (selectedBlockId === blockId) {
            const deletedIndex = prev.sequence.blocks.findIndex((block) => block.id === blockId);
            const fallback =
              next.blocks[deletedIndex] ?? next.blocks[deletedIndex - 1] ?? next.blocks[0];
            nextSelectedId = fallback?.id ?? null;
          }
          return { ...prev, sequence: next };
        });
        if (selectedBlockId === blockId) {
          setSelectedBlockId(nextSelectedId);
          setSelectedTransitionId(null);
        }
      },
      deleteSelectedBlock: () => {
        if (!selectedBlockId) return;
        const blockId = selectedBlockId;
        let nextSelectedId: string | null = null;
        updateSnapshot((prev) => {
          const next = removeBlockFromSequence(prev.sequence, blockId);
          const deletedIndex = prev.sequence.blocks.findIndex((block) => block.id === blockId);
          const fallback =
            next.blocks[deletedIndex] ?? next.blocks[deletedIndex - 1] ?? next.blocks[0];
          nextSelectedId = fallback?.id ?? null;
          return { ...prev, sequence: next };
        });
        setSelectedBlockId(nextSelectedId);
        setSelectedTransitionId(null);
      },
      deleteSelectedTransition: () => {
        if (!selectedTransitionId) return;
        updateSnapshot((prev) => ({
          ...prev,
          sequence: {
            ...prev.sequence,
            transitions: prev.sequence.transitions.filter((t) => t.id !== selectedTransitionId),
          },
        }));
        setSelectedTransitionId(null);
      },
      updateBlock: (blockId, updater) => {
        updateSnapshot((prev) => ({
          ...prev,
          sequence: {
            ...prev.sequence,
            blocks: prev.sequence.blocks.map((block) =>
              block.id === blockId ? updater(block) : block,
            ),
          },
        }));
      },
      updateBlockDuration: (blockId, duration) => {
        updateSnapshot((prev) => ({
          ...prev,
          sequence: {
            ...prev.sequence,
            blocks: prev.sequence.blocks.map((block) =>
              block.id === blockId ? { ...block, duration: Math.max(15, duration) } : block,
            ),
          },
        }));
      },
      updateBlockContent: (blockId, key, val) => {
        updateSnapshot((prev) => ({
          ...prev,
          sequence: {
            ...prev.sequence,
            blocks: prev.sequence.blocks.map((block) =>
              block.id === blockId
                ? { ...block, content: { ...block.content, [key]: val } }
                : block,
            ),
          },
        }));
      },
      updateBlockMotion: (blockId, key, val) => {
        updateSnapshot((prev) => ({
          ...prev,
          sequence: {
            ...prev.sequence,
            blocks: prev.sequence.blocks.map((block) =>
              block.id === blockId
                ? {
                    ...block,
                    motion: {
                      ...block.motion,
                      controls: { ...block.motion.controls, [key]: val },
                    },
                  }
                : block,
            ),
          },
        }));
      },
      updateBlockEasing: (blockId, easingId) => {
        updateSnapshot((prev) => ({
          ...prev,
          sequence: {
            ...prev.sequence,
            blocks: prev.sequence.blocks.map((block) =>
              block.id === blockId
                ? {
                    ...block,
                    motion: {
                      ...block.motion,
                      easingId,
                    },
                  }
                : block,
            ),
          },
        }));
      },
      updateTransition: (transitionId, updater) => {
        updateSnapshot((prev) => ({
          ...prev,
          sequence: {
            ...prev.sequence,
            transitions: prev.sequence.transitions.map((transition) =>
              transition.id === transitionId ? updater(transition) : transition,
            ),
          },
        }));
      },
      updateTransitionDuration: (transitionId, duration) => {
        updateSnapshot((prev) => ({
          ...prev,
          sequence: {
            ...prev.sequence,
            transitions: prev.sequence.transitions.map((transition) =>
              transition.id === transitionId
                ? { ...transition, duration: Math.max(1, duration) }
                : transition,
            ),
          },
        }));
      },
      updateCustomBrand: (updater) => {
        updateSnapshot((prev) => {
          const existing = prev.customBrands.find((b) => b.id === CUSTOM_BRAND_ID);
          const base = existing ?? createEmptyCustomBrand(resolveBrand(prev.sequence.brandPresetId, prev.customBrands));
          const updated = updater({ ...base, id: CUSTOM_BRAND_ID });
          const others = prev.customBrands.filter((b) => b.id !== CUSTOM_BRAND_ID);
          return {
            ...prev,
            customBrands: [...others, updated],
            sequence: { ...prev.sequence, brandPresetId: CUSTOM_BRAND_ID },
          };
        });
      },
      duplicateBrandToCustom: (sourceBrandId) => {
        const source = resolveBrand(sourceBrandId, customBrands);
        const custom = duplicateBrandAsCustom(source);
        updateSnapshot((prev) => {
          const others = prev.customBrands.filter((b) => b.id !== CUSTOM_BRAND_ID);
          return {
            ...prev,
            customBrands: [...others, custom],
            sequence: { ...prev.sequence, brandPresetId: CUSTOM_BRAND_ID },
          };
        });
        setShowBrandSystem(true);
      },
      commitBrandDraft: (brandDraft, logoText) => {
        updateSnapshot((prev) => {
          const existing = prev.customBrands.find((b) => b.id === CUSTOM_BRAND_ID);
          const base =
            existing ??
            createEmptyCustomBrand(resolveBrand(prev.sequence.brandPresetId, prev.customBrands));
          const updated: BrandPreset = {
            ...brandDraft,
            id: CUSTOM_BRAND_ID,
            name: brandDraft.name || base.name,
          };
          const others = prev.customBrands.filter((b) => b.id !== CUSTOM_BRAND_ID);
          return {
            ...prev,
            customBrands: [...others, updated],
            sequence: { ...prev.sequence, brandPresetId: CUSTOM_BRAND_ID, logoText },
          };
        });
      },
      saveCustomBrand: () => {
        const custom = customBrands.find((b) => b.id === CUSTOM_BRAND_ID);
        if (!custom) return;
        const savedId = `saved-${crypto.randomUUID().slice(0, 8)}`;
        const saved: BrandPreset = { ...structuredClone(custom), id: savedId };
        updateSnapshot((prev) => ({
          ...prev,
          customBrands: [...prev.customBrands.filter((b) => b.id !== savedId), saved],
        }));
      },
      addAsset: async (file) => {
        if (!file.type.startsWith("image/")) return null;
        try {
          const dataUrl = await readAssetAsDataUrl(file);
          const asset: ProjectAsset = {
            id: `asset-${crypto.randomUUID().slice(0, 8)}`,
            name: file.name,
            type: "image",
            dataUrl,
          };
          updateSnapshot((prev) => ({
            ...prev,
            assets: [...prev.assets, asset],
          }));
          return asset;
        } catch {
          return null;
        }
      },
      removeAsset: (assetId) => {
        updateSnapshot((prev) => ({
          ...prev,
          assets: prev.assets.filter((a) => a.id !== assetId),
        }));
      },
      replaceBlockAsset: (blockId, contentKey, assetId) => {
        const asset = assets.find((a) => a.id === assetId);
        if (!asset) return;
        updateSnapshot((prev) => ({
          ...prev,
          sequence: {
            ...prev.sequence,
            blocks: prev.sequence.blocks.map((block) =>
              block.id === blockId
                ? { ...block, content: { ...block.content, [contentKey]: asset.dataUrl } }
                : block,
            ),
          },
        }));
      },
      undo: history.undo,
      redo: history.redo,
      saveProject: () => {
        const project = snapshotProject(
          projectId,
          sequence.name,
          sequence,
          customBrands,
          assets,
        );
        const saved = saveProject(project);
        setProjectId(saved.id);
        savedSnapshotRef.current = createSnapshot(sequence, customBrands, assets);
      },
      newProject: (force = false) => {
        if (!force && isDirty) return false;
        const project = createNewProject();
        loadSnapshot(
          createSnapshot(project.sequence, project.customBrands, project.assets),
          project.id,
        );
        setStep("motion");
        return true;
      },
      loadProjectById: (id) => {
        const project = loadProject(id);
        if (!project) return;
        loadSnapshot(
          createSnapshot(project.sequence, project.customBrands, project.assets),
          project.id,
        );
        setStep("motion");
      },
      importProject: (project) => {
        loadSnapshot(
          createSnapshot(project.sequence, project.customBrands, project.assets),
          project.id,
        );
        setStep("motion");
      },
      setCurrentFrame,
      seekToFrame,
      togglePlayback,
      setIsPlaying,
      registerPlayer,
      nudgePlayhead,
      showToast,
      dismissToast,
    }),
    [
      step,
      sequence,
      selectedBlockId,
      selectedTransitionId,
      brand,
      allBrands,
      customBrands,
      format,
      fps,
      assets,
      projectId,
      isDirty,
      history,
      currentFrame,
      isPlaying,
      showShortcuts,
      showBrandSystem,
      showProjectMenu,
      settingsPanelView,
      postFx,
      camera,
      toast,
      updateSnapshot,
      loadSnapshot,
      setCurrentFrame,
      seekToFrame,
      togglePlayback,
      setIsPlaying,
      registerPlayer,
      nudgePlayhead,
      showToast,
      dismissToast,
    ],
  );

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditor must be used within EditorProvider");
  }
  return context;
}

export function useSelectedBlock() {
  const { sequence, selectedBlockId } = useEditor();
  return sequence.blocks.find((block) => block.id === selectedBlockId) ?? null;
}

export function useSelectedTransition() {
  const { sequence, selectedTransitionId } = useEditor();
  return (
    sequence.transitions.find((transition) => transition.id === selectedTransitionId) ?? null
  );
}
