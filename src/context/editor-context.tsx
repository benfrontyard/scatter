import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { defaultMotionSequence } from "@/config/sequences/default";
import { brandPresets } from "@/config/brands";
import { motionFormats } from "@/config/formats";
import { addBlockToSequence, removeBlockFromSequence } from "@/lib/sequence-utils";
import type { BlockTransition, MotionBlockInstance, MotionSequence } from "@/types";
import { EDITOR_FPS, type EditorStep } from "@/types/editor";

type EditorActions = {
  setStep: (step: EditorStep) => void;
  setBrand: (brandPresetId: string) => void;
  setFormat: (formatId: string) => void;
  setCanvasBackground: (color: string) => void;
  selectBlock: (blockId: string | null) => void;
  selectTransition: (transitionId: string | null) => void;
  clearSelection: () => void;
  addBlock: (blockId: string) => void;
  deleteBlock: (blockId: string) => void;
  deleteSelectedBlock: () => void;
  updateBlock: (blockId: string, updater: (block: MotionBlockInstance) => MotionBlockInstance) => void;
  updateBlockDuration: (blockId: string, duration: number) => void;
  updateBlockContent: (blockId: string, key: string, value: string) => void;
  updateBlockMotion: (blockId: string, key: string, value: number | string) => void;
  updateTransition: (
    transitionId: string,
    updater: (transition: BlockTransition) => BlockTransition,
  ) => void;
  updateTransitionDuration: (transitionId: string, duration: number) => void;
};

type EditorContextValue = {
  step: EditorStep;
  sequence: MotionSequence;
  selectedBlockId: string | null;
  selectedTransitionId: string | null;
  brand: (typeof brandPresets)[number];
  format: (typeof motionFormats)[number];
  fps: number;
} & EditorActions;

const EditorContext = createContext<EditorContextValue | null>(null);

export function EditorProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<EditorStep>("motion");
  const [sequence, setSequence] = useState<MotionSequence>(defaultMotionSequence);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [selectedTransitionId, setSelectedTransitionId] = useState<string | null>(null);

  const brand =
    brandPresets.find((preset) => preset.id === sequence.brandPresetId) ?? brandPresets[0];
  const format = motionFormats.find((item) => item.id === sequence.format) ?? motionFormats[0];

  const value = useMemo<EditorContextValue>(
    () => ({
      step,
      sequence,
      selectedBlockId,
      selectedTransitionId,
      brand,
      format,
      fps: EDITOR_FPS,
      setStep,
      setBrand: (brandPresetId) => {
        setSequence((prev) => ({ ...prev, brandPresetId }));
      },
      setFormat: (formatId) => {
        setSequence((prev) => ({ ...prev, format: formatId }));
      },
      setCanvasBackground: (color) => {
        setSequence((prev) => ({ ...prev, canvasBackground: color }));
      },
      selectBlock: (blockId) => {
        setSelectedBlockId(blockId);
        if (blockId) setSelectedTransitionId(null);
      },
      selectTransition: (transitionId) => {
        setSelectedTransitionId(transitionId);
        if (transitionId) setSelectedBlockId(null);
      },
      clearSelection: () => {
        setSelectedBlockId(null);
        setSelectedTransitionId(null);
      },
      addBlock: (blockId) => {
        let newBlockId: string | null = null;
        setSequence((prev) => {
          const result = addBlockToSequence(prev, blockId);
          newBlockId = result.newBlockId;
          return result.sequence;
        });
        setSelectedBlockId(newBlockId);
        setSelectedTransitionId(null);
      },
      deleteBlock: (blockId) => {
        let nextSelectedId: string | null = selectedBlockId;
        setSequence((prev) => {
          const next = removeBlockFromSequence(prev, blockId);
          if (selectedBlockId === blockId) {
            const deletedIndex = prev.blocks.findIndex((block) => block.id === blockId);
            const fallback =
              next.blocks[deletedIndex] ?? next.blocks[deletedIndex - 1] ?? next.blocks[0];
            nextSelectedId = fallback?.id ?? null;
          }
          return next;
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
        setSequence((prev) => {
          const next = removeBlockFromSequence(prev, blockId);
          const deletedIndex = prev.blocks.findIndex((block) => block.id === blockId);
          const fallback =
            next.blocks[deletedIndex] ?? next.blocks[deletedIndex - 1] ?? next.blocks[0];
          nextSelectedId = fallback?.id ?? null;
          return next;
        });
        setSelectedBlockId(nextSelectedId);
        setSelectedTransitionId(null);
      },
      updateBlock: (blockId, updater) => {
        setSequence((prev) => ({
          ...prev,
          blocks: prev.blocks.map((block) => (block.id === blockId ? updater(block) : block)),
        }));
      },
      updateBlockDuration: (blockId, duration) => {
        setSequence((prev) => ({
          ...prev,
          blocks: prev.blocks.map((block) =>
            block.id === blockId ? { ...block, duration: Math.max(15, duration) } : block,
          ),
        }));
      },
      updateBlockContent: (blockId, key, value) => {
        setSequence((prev) => ({
          ...prev,
          blocks: prev.blocks.map((block) =>
            block.id === blockId
              ? { ...block, content: { ...block.content, [key]: value } }
              : block,
          ),
        }));
      },
      updateBlockMotion: (blockId, key, value) => {
        setSequence((prev) => ({
          ...prev,
          blocks: prev.blocks.map((block) =>
            block.id === blockId
              ? {
                  ...block,
                  motion: {
                    ...block.motion,
                    controls: { ...block.motion.controls, [key]: value },
                  },
                }
              : block,
          ),
        }));
      },
      updateTransition: (transitionId, updater) => {
        setSequence((prev) => ({
          ...prev,
          transitions: prev.transitions.map((transition) =>
            transition.id === transitionId ? updater(transition) : transition,
          ),
        }));
      },
      updateTransitionDuration: (transitionId, duration) => {
        setSequence((prev) => ({
          ...prev,
          transitions: prev.transitions.map((transition) =>
            transition.id === transitionId
              ? { ...transition, duration: Math.max(1, duration) }
              : transition,
          ),
        }));
      },
    }),
    [step, sequence, selectedBlockId, selectedTransitionId, brand, format],
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
