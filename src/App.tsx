import { EditorProvider } from "@/context/editor-context";
import { ThemeProvider } from "@/context/theme-context";
import { EditorLayout } from "@/components/layout/EditorLayout";
import { KeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { KeyboardShortcutsModal } from "@/components/editor/KeyboardShortcutsModal";
import { ProjectMenu } from "@/components/editor/ProjectMenu";
import { BrandSystemView } from "@/components/brand-system/BrandSystemView";
import { MotionBlockPlayground } from "@/components/motion-playground/MotionBlockPlayground";
import { BlockBuilder } from "@/components/admin/BlockBuilder";
import { BlockLibraryManager } from "@/components/admin/BlockLibraryManager";
import { BrandTestLab } from "@/components/admin/BrandTestLab";
import { DebugTools } from "@/components/admin/DebugTools";
import { EditorToast } from "@/components/editor/EditorToast";

export default function App() {
  return (
    <ThemeProvider>
    <EditorProvider>
      <KeyboardShortcuts />
      <EditorLayout />
      <KeyboardShortcutsModal />
      <ProjectMenu />
      <BrandSystemView />
      <MotionBlockPlayground />
      <BlockBuilder />
      <BlockLibraryManager />
      <BrandTestLab />
      <DebugTools />
      <EditorToast />
    </EditorProvider>
    </ThemeProvider>
  );
}
