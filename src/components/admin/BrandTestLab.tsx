import { Button } from "@/components/ui/button";
import { useEditor } from "@/context/editor-context";
import { playgroundBrandKits } from "@/config/motion-playground/brands";
import { ArrowLeft } from "lucide-react";

export function BrandTestLab({ embedded = false }: { embedded?: boolean }) {
  const { showBrandTestLab, setShowBrandTestLab, isInternal, setShowBrandSystem } = useEditor();

  if (!isInternal) return null;
  if (!embedded && !showBrandTestLab) return null;

  const content = (
    <div className="flex-1 overflow-y-auto p-6">
      <p className="mb-4 text-sm text-muted-foreground">
        Test motion blocks against playground brand kits. Open the brand editor to customize, or use
        Studio Playground to preview blocks with these kits.
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
          if (!embedded) setShowBrandTestLab(false);
          setShowBrandSystem(true);
        }}
      >
        Open brand editor
      </Button>
    </div>
  );

  if (embedded) {
    return <div className="h-full min-h-0 overflow-hidden">{content}</div>;
  }

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
      {content}
    </div>
  );
}
