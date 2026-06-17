import { EditorProvider } from "@/context/editor-context";
import { EditorLayout } from "@/components/layout/EditorLayout";

export default function App() {
  return (
    <EditorProvider>
      <EditorLayout />
    </EditorProvider>
  );
}
