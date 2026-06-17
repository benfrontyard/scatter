import { EditorProvider } from "@/context/editor-context";
import { EditorLayout } from "@/components/layout/EditorLayout";
import { KeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { KeyboardShortcutsModal } from "@/components/editor/KeyboardShortcutsModal";
import { ProjectMenu } from "@/components/editor/ProjectMenu";
import { BrandSettingsModal } from "@/components/editor/BrandSettingsModal";

export default function App() {
  return (
    <EditorProvider>
      <KeyboardShortcuts />
      <EditorLayout />
      <KeyboardShortcutsModal />
      <ProjectMenu />
      <BrandSettingsModal />
    </EditorProvider>
  );
}
