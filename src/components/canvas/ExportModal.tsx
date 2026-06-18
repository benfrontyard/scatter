import { ExportPanel } from "@/components/editor/ExportPanel";
import { useEditor } from "@/context/editor-context";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExportModal() {
  const { showExportModal, setShowExportModal } = useEditor();

  if (!showExportModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close export"
        onClick={() => setShowExportModal(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-modal-title"
        className="relative z-10 flex max-h-[min(90vh,720px)] w-full max-w-md flex-col overflow-hidden rounded-lg border border-border bg-card shadow-2xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
          <h2 id="export-modal-title" className="text-sm font-semibold">
            Export video
          </h2>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowExportModal(false)}
            aria-label="Close export"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <ExportPanel compact />
        </div>
      </div>
    </div>
  );
}
