import { useState } from "react";
import { BlockWorkbench } from "@/components/studio/BlockWorkbench";
import { NewBlockFlow } from "@/components/studio/NewBlockFlow";
import { useStudio } from "@/context/studio-context";

type BlocksView = "workspace" | "new-block";

export function BlocksStudio() {
  const { setSelectedBlockId } = useStudio();
  const [view, setView] = useState<BlocksView>("workspace");

  if (view === "new-block") {
    return (
      <NewBlockFlow
        onCancel={() => setView("workspace")}
        onComplete={(blockId) => {
          setSelectedBlockId(blockId);
          setView("workspace");
        }}
      />
    );
  }

  return <BlockWorkbench onNewBlock={() => setView("new-block")} />;
}
