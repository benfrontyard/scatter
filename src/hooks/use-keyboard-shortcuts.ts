import { useEffect } from "react";
import { useEditor } from "@/context/editor-context";

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    target.isContentEditable
  );
}

export function KeyboardShortcuts() {
  const {
    undo,
    redo,
    saveProject,
    newProject,
    togglePlayback,
    deleteSelectedBlock,
    deleteSelectedTransition,
    clearSelection,
    nudgePlayhead,
    setShowShortcuts,
    showShortcuts,
    selectedBlockId,
    selectedTransitionId,
    isDirty,
  } = useEditor();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey;
      const typing = isTypingTarget(event.target);

      if (event.key === "?" && !typing) {
        event.preventDefault();
        setShowShortcuts(!showShortcuts);
        return;
      }

      if (event.key === "Escape") {
        clearSelection();
        if (showShortcuts) setShowShortcuts(false);
        return;
      }

      if (mod && event.key === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
        return;
      }

      if ((mod && event.shiftKey && event.key === "z") || (mod && event.key === "y")) {
        event.preventDefault();
        redo();
        return;
      }

      if (mod && event.key === "s") {
        event.preventDefault();
        saveProject();
        return;
      }

      if (mod && event.key === "n") {
        event.preventDefault();
        if (isDirty) {
          const confirmed = window.confirm(
            "You have unsaved changes. Start a new project anyway?",
          );
          if (!confirmed) return;
        }
        newProject(true);
        return;
      }

      if (typing) return;

      if (event.key === " " || event.code === "Space") {
        event.preventDefault();
        // #region agent log
        fetch('http://127.0.0.1:7333/ingest/b24888df-fe91-4b21-bfa6-9cf313f7d223',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'3f7d42'},body:JSON.stringify({sessionId:'3f7d42',location:'use-keyboard-shortcuts.ts:84',message:'spacebar togglePlayback',data:{typing},timestamp:Date.now(),hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        togglePlayback();
        return;
      }

      if (event.key === "Delete" || event.key === "Backspace") {
        if (selectedBlockId) {
          event.preventDefault();
          deleteSelectedBlock();
        } else if (selectedTransitionId) {
          event.preventDefault();
          deleteSelectedTransition();
        }
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        nudgePlayhead(-1);
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        nudgePlayhead(1);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    undo,
    redo,
    saveProject,
    newProject,
    togglePlayback,
    deleteSelectedBlock,
    deleteSelectedTransition,
    clearSelection,
    nudgePlayhead,
    setShowShortcuts,
    showShortcuts,
    selectedBlockId,
    selectedTransitionId,
    isDirty,
  ]);

  return null;
}
