import { BlockBuilder } from "@/components/admin/BlockBuilder";
import { useEditor } from "@/context/editor-context";
import { useStudio } from "@/context/studio-context";
import type { MotionBlockLibraryEntry } from "@/types/motion-block-library";

export function StudioBuilder() {
  const { setStudioTab, showToast } = useEditor();
  const { addBlock } = useStudio();

  const handleSaveDraft = (draft: MotionBlockLibraryEntry) => {
    addBlock(draft);
    setStudioTab("blocks");
    showToast({
      message: `"${draft.name}" saved as draft. Review it across brands and aspect ratios.`,
    });
  };

  return <BlockBuilder embedded onSaveDraftBlock={handleSaveDraft} />;
}
