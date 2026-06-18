import { useEditor } from "@/context/editor-context";
import { updateBlock3DDepthMode } from "@/lib/camera";
import type { DepthMode, MotionBlockInstance } from "@/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Camera, Crosshair } from "lucide-react";
import { cn } from "@/lib/utils";

const DEPTH_MODES: { value: DepthMode; label: string; description: string }[] = [
  { value: "flat", label: "Flat", description: "No 3D depth" },
  { value: "subtle", label: "Subtle", description: "Light parallax and depth" },
  { value: "strong", label: "Strong", description: "Pronounced depth separation" },
];

type Block3DPanelProps = {
  block: MotionBlockInstance;
};

export function Block3DPanel({ block }: Block3DPanelProps) {
  const { updateBlock3D, focusCameraOnBlock, setSettingsPanelView } = useEditor();

  const depthMode = block.block3D?.depthMode ?? "flat";
  const canBeFocusTarget = block.block3D?.canBeFocusTarget !== false;

  return (
    <AccordionItem value="depth3d" className="border-border">
      <AccordionTrigger className="text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Camera className="h-3 w-3" />
          3D / Depth
        </span>
      </AccordionTrigger>
      <AccordionContent className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-[10px] text-muted-foreground">Depth mode</Label>
          <div className="grid grid-cols-3 gap-1.5">
            {DEPTH_MODES.map((mode) => (
              <button
                key={mode.value}
                type="button"
                onClick={() =>
                  updateBlock3D(block.id, updateBlock3DDepthMode(block.block3D, mode.value))
                }
                className={cn(
                  "rounded-md border px-2 py-2 text-center transition-colors",
                  depthMode === mode.value
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-background/50 text-muted-foreground hover:border-primary/40",
                )}
              >
                <span className="block text-[10px] font-medium">{mode.label}</span>
              </button>
            ))}
          </div>
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            {DEPTH_MODES.find((m) => m.value === depthMode)?.description}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2">
          <Label className="text-xs">Can be focus target</Label>
          <Button
            type="button"
            size="sm"
            variant={canBeFocusTarget ? "default" : "outline"}
            className="h-7 text-[10px]"
            onClick={() =>
              updateBlock3D(block.id, {
                ...updateBlock3DDepthMode(block.block3D, depthMode),
                canBeFocusTarget: !canBeFocusTarget,
              })
            }
          >
            {canBeFocusTarget ? "Yes" : "No"}
          </Button>
        </div>

        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 w-full text-[10px]"
          onClick={() => {
            focusCameraOnBlock(block.id);
            setSettingsPanelView("camera");
          }}
        >
          <Crosshair className="mr-1 h-3 w-3" />
          Focus camera on this
        </Button>
      </AccordionContent>
    </AccordionItem>
  );
}

function CameraJumpButton() {
  const { setSettingsPanelView } = useEditor();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-7 w-full text-[10px]"
      onClick={() => setSettingsPanelView("camera")}
    >
      <Camera className="mr-1 h-3 w-3" />
      Open Camera
    </Button>
  );
}

export { CameraJumpButton };
