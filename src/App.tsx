import { EditorProvider } from "@/context/editor-context";
import { EditorLayout } from "@/components/layout/EditorLayout";
import { KeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { KeyboardShortcutsModal } from "@/components/editor/KeyboardShortcutsModal";
import { ProjectMenu } from "@/components/editor/ProjectMenu";
import { BrandSystemView } from "@/components/brand-system/BrandSystemView";

export default function App() {
  return (
    <EditorProvider>
      <KeyboardShortcuts />
      <EditorLayout />
      <KeyboardShortcutsModal />
      <ProjectMenu />
      <BrandSystemView />
    </EditorProvider>
  );
}
