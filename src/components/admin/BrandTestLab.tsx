import { Button } from "@/components/ui/button";
import { useEditor } from "@/context/editor-context";
import { playgroundBrandKits } from "@/config/motion-playground/brands";
import { ArrowLeft } from "lucide-react";

export function BrandTestLab() {
  const { showBrandTestLab, setShowBrandTestLab, isAdminMode, setShowBrandSystem } = useEditor();

  if (!isAdminMode || !showBrandTestLab) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <header className="flex h-11 shrink-0 items-center gap-2 border-b border-border px-3">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5"
          onClick={() => setShowBrandTestLab(false)}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Button>
        <span className="text-sm font-semibold">Brand Test Lab</span>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <p className="mb-4 text-sm text-muted-foreground">
          Test motion blocks against playground brand kits. Open the brand editor to customize, or
          use the Motion Block Playground to preview blocks with these kits.
        </p>
        <ul className="mb-6 space-y-2">
          {playgroundBrandKits.map((kit) => (
            <li
              key={kit.id}
              className="flex items-center justify-between rounded-md border border-border px-3 py-2"
            >
              <div>
                <span className="text-sm font-medium">{kit.name}</span>
                <p className="text-[10px] text-muted-foreground">{kit.id}</p>
              </div>
              <div
                className="h-6 w-6 rounded border border-border"
                style={{ background: kit.colors.background }}
                title={kit.colors.background}
              />
            </li>
          ))}
        </ul>
        <Button
          size="sm"
          onClick={() => {
            setShowBrandTestLab(false);
            setShowBrandSystem(true);
          }}
        >
          Open brand editor
        </Button>
      </div>
    </div>
  );
}
