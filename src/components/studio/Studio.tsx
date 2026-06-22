import { BlocksStudio } from "@/components/studio/BlocksStudio";
import { BrandLab } from "@/components/studio/BrandLab";
import { StudioDiagnostics } from "@/components/studio/StudioDiagnostics";
import { EditorShell } from "@/components/layout/EditorShell";
import { StudioTopBar } from "@/components/layout/StudioTopBar";
import { StudioProvider } from "@/context/studio-context";
import { StudioWorkbenchProvider } from "@/context/studio-workbench-context";
import { useEditor } from "@/context/editor-context";
import { useMediaQuery } from "@/hooks/use-media-query";
import { mediaQueries } from "@/lib/breakpoints";

export function Studio() {
  const { isInternal, appShell, studioTab } = useEditor();
  const isMobile = useMediaQuery(mediaQueries.mobile);

  if (!isInternal || appShell !== "studio") return null;

  return (
    <StudioProvider>
      <StudioWorkbenchProvider>
        <EditorShell mode="studio" overlay topBar={<StudioTopBar compact={isMobile} />}>
          {studioTab === "blocks" && <BlocksStudio />}
          {studioTab === "brand-lab" && <BrandLab />}
          {studioTab === "diagnostics" && <StudioDiagnostics />}
        </EditorShell>
      </StudioWorkbenchProvider>
    </StudioProvider>
  );
}
