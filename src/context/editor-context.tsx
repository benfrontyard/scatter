import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { defaultMotionSequence } from "@/config/sequences/default";
import { motionFormats } from "@/config/formats";
import {
  addBlockToSequence,
  removeBlockFromSequence,
  reorderBlockInSequence,
  scaleSequenceToTargetDuration,
} from "@/lib/sequence-utils";
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
  MagicEditSettings,
  MotionBlockInstance,
  MotionSequence,
  MusicTrack,
  PostFXSettings,
  ProjectAsset,
  CameraSettings,
  Block3DSettings,
  VoiceoverTrack,
  WordTimestamp,
} from "@/types";
import { DEFAULT_AUDIO_MIX } from "@/types/audio";
import { DEFAULT_MAGIC_EDIT_SETTINGS } from "@/types/magic-edit";
import { getAudioDuration } from "@/lib/audio";
import { getOrDecodeAudioBuffer } from "@/lib/audio/audio-buffer-cache";
import { runMagicEditPipeline } from "@/lib/magic-edit";
import { buildAnixaDemoProject } from "@/lib/demo/anixa-demo";
import { EDITOR_FPS, type EditorStep, type MainNavId, type StudioTab, type WorkspaceTab } from "@/types/editor";
import type { User, UserRole } from "@/types/user";
import { isInternalRole } from "@/types/user";
import { normalizePostFXSettings } from "@/lib/post-fx";
import { usePlaybackEngine } from "@/hooks/use-playback-engine";
import {
  applyCameraPreset as buildCameraPreset,
  focusCameraOnBlock as setCameraFocus,
  normalizeCameraSettings,
} from "@/lib/camera";
import type { PlayerRef } from "@remotion/player";

type SettingsPanelView = "project" | "postFx" | "camera" | "audio";

const USER_ROLE_STORAGE_KEY = "scatter-user-role";

function readStoredUserRole(): UserRole {
  if (typeof window === "undefined") return "user";
  const stored = window.localStorage.getItem(USER_ROLE_STORAGE_KEY);
  if (stored === "internal" || stored === "admin" || stored === "maker") return "internal";
  if (stored === "user") return "user";
  return "user";
}

function createDefaultUser(role: UserRole = readStoredUserRole()): User {
  return { id: "local-user", name: "User", role };
}

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
  reorderBlock: (blockId: string, toIndex: number) => void;
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
  applyDurationPreset: (targetSeconds: number) => void;
  updateCustomBrand: (updater: (brand: BrandPreset) => BrandPreset) => void;
  commitBrandDraft: (brand: BrandPreset, logoText: string) => void;
  duplicateBrandToCustom: (sourceBrandId: string) => void;
  saveCustomBrand: () => void;
  addAsset: (file: File) => Promise<ProjectAsset | null>;
  addAudioAsset: (file: File) => Promise<ProjectAsset | null>;
  removeAsset: (assetId: string) => void;
  setVoiceover: (track: VoiceoverTrack | undefined) => void;
  setMusicTrack: (track: MusicTrack | undefined) => void;
  setVoiceoverTranscript: (transcript: string) => void;
  setVoiceoverWordTimestamps: (timestamps: WordTimestamp[] | undefined) => void;
  runMagicEdit: (settings?: Partial<MagicEditSettings>) => Promise<boolean>;
  magicEditSettings: MagicEditSettings;
  setMagicEditSettings: (settings: Partial<MagicEditSettings>) => void;
  isMagicEditRunning: boolean;
  loadAnixaDemo: (runMagicEditAfter?: boolean) => Promise<boolean>;
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
  setUserRole: (role: UserRole) => void;
  setWorkspaceTab: (tab: WorkspaceTab) => void;
  setMainNav: (nav: MainNavId) => void;
  setShowBlockBuilder: (show: boolean) => void;
  setShowBlockLibraryManager: (show: boolean) => void;
  setShowBrandTestLab: (show: boolean) => void;
  setShowDebugTools: (show: boolean) => void;
  showBlockLibraryDrawer: boolean;
  setShowBlockLibraryDrawer: (show: boolean) => void;
  showSettingsInspector: boolean;
  setShowSettingsInspector: (show: boolean) => void;
  settingsInspectorPinned: boolean;
  setSettingsInspectorPinned: (pinned: boolean) => void;
  openSettingsInspector: () => void;
  closeSettingsInspector: () => void;
  showExportModal: boolean;
  setShowExportModal: (show: boolean) => void;
  showBrandPanel: boolean;
  setShowBrandPanel: (show: boolean) => void;
  timelineCollapsed: boolean;
  setTimelineCollapsed: (collapsed: boolean) => void;
  showStudio: boolean;
  setShowStudio: (show: boolean) => void;
  studioTab: StudioTab;
  setStudioTab: (tab: StudioTab) => void;
  showInternalBlocks: boolean;
  setShowInternalBlocks: (show: boolean) => void;
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
  effectivePreviewQuality: import("@/types/post-fx").PostFXQuality;
  showShortcuts: boolean;
  setShowShortcuts: (show: boolean) => void;
  showBrandSystem: boolean;
  setShowBrandSystem: (show: boolean) => void;
  showMotionPlayground: boolean;
  setShowMotionPlayground: (show: boolean) => void;
  showProjectMenu: boolean;
  setShowProjectMenu: (show: boolean) => void;
  settingsPanelView: SettingsPanelView;
  postFx: PostFXSettings;
  camera: CameraSettings;
  toast: EditorToastState | null;
  magicEditSettings: MagicEditSettings;
  isMagicEditRunning: boolean;
  user: User;
  isAdminMode: boolean;
  isInternal: boolean;
  workspaceTab: WorkspaceTab;
  mainNav: MainNavId;
  showBlockBuilder: boolean;
  showBlockLibraryManager: boolean;
  showBrandTestLab: boolean;
  showDebugTools: boolean;
  showBlockLibraryDrawer: boolean;
  showSettingsInspector: boolean;
  settingsInspectorPinned: boolean;
  showExportModal: boolean;
  showBrandPanel: boolean;
  timelineCollapsed: boolean;
  showStudio: boolean;
  studioTab: StudioTab;
  showInternalBlocks: boolean;
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
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showBrandSystem, setShowBrandSystem] = useState(false);
  const [showMotionPlayground, setShowMotionPlayground] = useState(false);
  const [showBlockBuilder, setShowBlockBuilder] = useState(false);
  const [showBlockLibraryManager, setShowBlockLibraryManager] = useState(false);
  const [showBrandTestLab, setShowBrandTestLab] = useState(false);
  const [showDebugTools, setShowDebugTools] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [showBlockLibraryDrawer, setShowBlockLibraryDrawer] = useState(false);
  const [showSettingsInspector, setShowSettingsInspector] = useState(false);
  const [settingsInspectorPinned, setSettingsInspectorPinned] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showBrandPanel, setShowBrandPanel] = useState(false);
  const [timelineCollapsed, setTimelineCollapsed] = useState(false);
  const [showStudio, setShowStudio] = useState(false);
  const [studioTab, setStudioTab] = useState<StudioTab>("review");
  const [showInternalBlocks, setShowInternalBlocks] = useState(false);
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>("timeline");
  const [mainNav, setMainNav] = useState<MainNavId>("home");
  const [user, setUserState] = useState<User>(() => createDefaultUser());
  const [settingsPanelView, setSettingsPanelView] = useState<SettingsPanelView>("project");
  const [magicEditSettings, setMagicEditSettingsState] = useState<MagicEditSettings>(
    DEFAULT_MAGIC_EDIT_SETTINGS,
  );
  const [isMagicEditRunning, setIsMagicEditRunning] = useState(false);
  const [toast, setToast] = useState<EditorToastState | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

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

  const playback = usePlaybackEngine({
    sequence,
    assets,
    previewQuality: postFx.previewQuality,
  });

  const { currentFrame, isPlaying, effectiveQuality: effectivePreviewQuality } = playback;

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
      playback.seekToFrame(0);
    },
    [history, playback],
  );

  const setCurrentFrame = useCallback((frame: number) => {
    playback.seekToFrame(frame);
  }, [playback]);

  const seekToFrame = useCallback((frame: number) => {
    playback.seekToFrame(frame);
  }, [playback]);

  const togglePlayback = useCallback(() => {
    playback.togglePlayback();
  }, [playback]);

  const setIsPlaying = useCallback((playing: boolean) => {
    if (playing) {
      void playback.play();
    } else {
      playback.pause();
    }
  }, [playback]);

  const registerPlayer = useCallback((player: PlayerRef | null) => {
    playback.registerPlayer(player);
  }, [playback]);

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

  const isInternal = isInternalRole(user.role);
  const isAdminMode = isInternal;

  const openSettingsInspector = useCallback(() => {
    setShowSettingsInspector(true);
  }, []);

  const closeSettingsInspector = useCallback(() => {
    if (!settingsInspectorPinned) {
      setShowSettingsInspector(false);
    }
  }, [settingsInspectorPinned]);

  const setUserRole = useCallback((role: UserRole) => {
    setUserState((prev) => ({ ...prev, role }));
    if (typeof window !== "undefined") {
      window.localStorage.setItem(USER_ROLE_STORAGE_KEY, role);
    }
  }, []);

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
      effectivePreviewQuality,
      showShortcuts,
      setShowShortcuts,
      showBrandSystem,
      setShowBrandSystem,
      showMotionPlayground,
      setShowMotionPlayground,
      showBlockBuilder,
      setShowBlockBuilder,
      showBlockLibraryManager,
      setShowBlockLibraryManager,
      showBrandTestLab,
      setShowBrandTestLab,
      showDebugTools,
      setShowDebugTools,
      showProjectMenu,
      setShowProjectMenu,
      showBlockLibraryDrawer,
      setShowBlockLibraryDrawer,
      showSettingsInspector,
      setShowSettingsInspector,
      settingsInspectorPinned,
      setSettingsInspectorPinned,
      openSettingsInspector,
      closeSettingsInspector,
      showExportModal,
      setShowExportModal,
      showBrandPanel,
      setShowBrandPanel,
      timelineCollapsed,
      setTimelineCollapsed,
      showStudio,
      setShowStudio,
      studioTab,
      setStudioTab,
      showInternalBlocks,
      setShowInternalBlocks,
      workspaceTab,
      setWorkspaceTab,
      mainNav,
      setMainNav,
      user,
      isAdminMode,
      isInternal,
      setUserRole,
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
          setShowSettingsInspector(true);
        }
      },
      selectTransition: (transitionId) => {
        setSelectedTransitionId(transitionId);
        if (transitionId) {
          setSelectedBlockId(null);
          setStep("motion");
          setShowSettingsInspector(true);
        }
      },
      clearSelection: () => {
        setSelectedBlockId(null);
        setSelectedTransitionId(null);
        if (!settingsInspectorPinned) {
          setShowSettingsInspector(false);
        }
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
        setShowBlockLibraryDrawer(false);
        setShowSettingsInspector(true);
      },
      reorderBlock: (blockId, toIndex) => {
        updateSnapshot((prev) => ({
          ...prev,
          sequence: reorderBlockInSequence(prev.sequence, blockId, toIndex),
        }));
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
      applyDurationPreset: (targetSeconds) => {
        updateSnapshot((prev) => ({
          ...prev,
          sequence: scaleSequenceToTargetDuration(prev.sequence, targetSeconds, fps),
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
      addAudioAsset: async (file) => {
        if (!file.type.startsWith("audio/")) return null;
        try {
          const dataUrl = await readAssetAsDataUrl(file);
          const duration = await getAudioDuration(dataUrl);
          const asset: ProjectAsset = {
            id: `audio-${crypto.randomUUID().slice(0, 8)}`,
            name: file.name,
            type: "audio",
            dataUrl,
            duration,
            mimeType: file.type,
          };
          updateSnapshot((prev) => ({
            ...prev,
            assets: [...prev.assets, asset],
          }));
          void getOrDecodeAudioBuffer(asset.id, dataUrl);
          return asset;
        } catch {
          return null;
        }
      },
      setVoiceover: (track) => {
        updateSnapshot((prev) => ({
          ...prev,
          sequence: {
            ...prev.sequence,
            audio: {
              mix: prev.sequence.audio?.mix ?? DEFAULT_AUDIO_MIX,
              markers: prev.sequence.audio?.markers ?? [],
              music: prev.sequence.audio?.music,
              voiceover: track,
            },
          },
        }));
      },
      setMusicTrack: (track) => {
        updateSnapshot((prev) => ({
          ...prev,
          sequence: {
            ...prev.sequence,
            audio: {
              mix: prev.sequence.audio?.mix ?? DEFAULT_AUDIO_MIX,
              markers: prev.sequence.audio?.markers ?? [],
              voiceover: prev.sequence.audio?.voiceover,
              music: track,
            },
          },
        }));
      },
      setVoiceoverTranscript: (transcript) => {
        updateSnapshot((prev) => {
          const voiceover = prev.sequence.audio?.voiceover;
          if (!voiceover) return prev;
          return {
            ...prev,
            sequence: {
              ...prev.sequence,
              audio: {
                ...prev.sequence.audio!,
                voiceover: { ...voiceover, transcript },
              },
            },
          };
        });
      },
      setVoiceoverWordTimestamps: (timestamps) => {
        updateSnapshot((prev) => {
          const voiceover = prev.sequence.audio?.voiceover;
          if (!voiceover) return prev;
          return {
            ...prev,
            sequence: {
              ...prev.sequence,
              audio: {
                ...prev.sequence.audio!,
                voiceover: { ...voiceover, wordTimestamps: timestamps },
              },
            },
          };
        });
      },
      magicEditSettings,
      setMagicEditSettings: (partial) => {
        setMagicEditSettingsState((prev: MagicEditSettings) => ({ ...prev, ...partial }));
      },
      isMagicEditRunning,
      loadAnixaDemo: async (runMagicEditAfter = true) => {
        if (isMagicEditRunning) return false;
        setIsMagicEditRunning(true);
        try {
          const project = await buildAnixaDemoProject();
          loadSnapshot(
            createSnapshot(project.sequence, project.customBrands, project.assets),
            project.id,
          );
          setSettingsPanelView("audio");
          if (runMagicEditAfter) {
            const pipeline = await runMagicEditPipeline({
              sequence: project.sequence,
              assets: project.assets,
              brand: resolveBrand(project.sequence.brandPresetId, project.customBrands),
              settings: magicEditSettings,
            });
            updateSnapshot((prev) => ({
              ...prev,
              sequence: {
                ...prev.sequence,
                blocks: pipeline.result.blocks,
                audio: pipeline.audio,
              },
            }));
          }
          showToast({
            message: runMagicEditAfter
              ? "Anixa demo loaded — Magic Edit applied. Scrub timeline to review."
              : "Anixa demo loaded with VO, music, and script.",
          });
          return true;
        } catch (error) {
          showToast({
            message:
              error instanceof Error ? error.message : "Failed to load Anixa demo.",
          });
          return false;
        } finally {
          setIsMagicEditRunning(false);
        }
      },
      runMagicEdit: async (settingsOverride) => {
        if (isMagicEditRunning) return false;
        setIsMagicEditRunning(true);
        try {
          const settings = { ...magicEditSettings, ...settingsOverride };
          const pipeline = await runMagicEditPipeline({
            sequence,
            assets,
            brand,
            settings,
          });
          updateSnapshot((prev) => ({
            ...prev,
            sequence: {
              ...prev.sequence,
              blocks: pipeline.result.blocks,
              audio: pipeline.audio,
            },
          }));
          showToast({ message: "Magic Edit applied — review and adjust timing as needed." });
          return true;
        } catch (error) {
          showToast({
            message:
              error instanceof Error ? error.message : "Magic Edit failed. Check your audio setup.",
          });
          return false;
        } finally {
          setIsMagicEditRunning(false);
        }
      },
      removeAsset: (assetId) => {
        updateSnapshot((prev) => {
          const audio = prev.sequence.audio;
          const clearsVoiceover = audio?.voiceover?.assetId === assetId;
          const clearsMusic = audio?.music?.assetId === assetId;
          return {
            ...prev,
            assets: prev.assets.filter((a) => a.id !== assetId),
            sequence: {
              ...prev.sequence,
              audio: audio
                ? {
                    ...audio,
                    voiceover: clearsVoiceover ? undefined : audio.voiceover,
                    music: clearsMusic ? undefined : audio.music,
                  }
                : undefined,
            },
          };
        });
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
      effectivePreviewQuality,
      showShortcuts,
      showBrandSystem,
      showMotionPlayground,
      showBlockBuilder,
      showBlockLibraryManager,
      showBrandTestLab,
      showDebugTools,
      showProjectMenu,
      showBlockLibraryDrawer,
      showSettingsInspector,
      settingsInspectorPinned,
      showExportModal,
      showBrandPanel,
      timelineCollapsed,
      showStudio,
      studioTab,
      showInternalBlocks,
      workspaceTab,
      mainNav,
      user,
      isAdminMode,
      isInternal,
      setUserRole,
      openSettingsInspector,
      closeSettingsInspector,
      settingsPanelView,
      postFx,
      camera,
      toast,
      magicEditSettings,
      isMagicEditRunning,
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
