import { useEditor } from "@/context/editor-context";
import { HomeShell } from "@/components/home/HomeShell";
import { CreateFlowShell } from "@/components/create-flow/CreateFlowShell";
import { EditorLayout } from "@/components/layout/EditorLayout";
import { Studio } from "@/components/studio/Studio";

export function AppShellRouter() {
  const { appShell } = useEditor();

  switch (appShell) {
    case "home":
      return <HomeShell />;
    case "createFlow":
      return <CreateFlowShell />;
    case "studio":
      return <Studio />;
    case "editor":
    default:
      return <EditorLayout />;
  }
}
