import { getPlaygroundBlocks } from "@/lib/motion-block-library";
import type { MotionBlockLibraryEntry } from "@/types/motion-block-library";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type StudioContextValue = {
  blocks: MotionBlockLibraryEntry[];
  selectedBlockId: string;
  selectedBlock: MotionBlockLibraryEntry | undefined;
  setSelectedBlockId: (id: string) => void;
  updateBlock: (block: MotionBlockLibraryEntry) => void;
  addBlock: (block: MotionBlockLibraryEntry) => void;
  setBlocks: React.Dispatch<React.SetStateAction<MotionBlockLibraryEntry[]>>;
};

const StudioContext = createContext<StudioContextValue | null>(null);

export function StudioProvider({ children }: { children: ReactNode }) {
  const [blocks, setBlocks] = useState<MotionBlockLibraryEntry[]>(() => getPlaygroundBlocks());
  const [selectedBlockId, setSelectedBlockId] = useState(() => getPlaygroundBlocks()[0]?.id ?? "");

  const selectedBlock = useMemo(
    () => blocks.find((b) => b.id === selectedBlockId) ?? blocks[0],
    [blocks, selectedBlockId],
  );

  const updateBlock = useCallback((block: MotionBlockLibraryEntry) => {
    setBlocks((prev) => prev.map((b) => (b.id === block.id ? block : b)));
  }, []);

  const addBlock = useCallback((block: MotionBlockLibraryEntry) => {
    setBlocks((prev) => [...prev, block]);
    setSelectedBlockId(block.id);
  }, []);

  const value = useMemo(
    () => ({
      blocks,
      selectedBlockId: selectedBlock?.id ?? selectedBlockId,
      selectedBlock,
      setSelectedBlockId,
      updateBlock,
      addBlock,
      setBlocks,
    }),
    [blocks, selectedBlock, selectedBlockId, updateBlock, addBlock],
  );

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
}

export function useStudio() {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error("useStudio must be used within StudioProvider");
  return ctx;
}
