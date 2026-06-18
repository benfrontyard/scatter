import { EditorProvider } from "@/context/editor-context";
import { ThemeProvider } from "@/context/theme-context";
import { EditorLayout } from "@/components/layout/EditorLayout";
import { KeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { KeyboardShortcutsModal } from "@/components/editor/KeyboardShortcutsModal";
import { ProjectMenu } from "@/components/editor/ProjectMenu";
import { BrandSystemView } from "@/components/brand-system/BrandSystemView";
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
      <EditorToast />
    </EditorProvider>
    </ThemeProvider>
  );
}
