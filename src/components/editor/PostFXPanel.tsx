import {
  postFxEffectDefinitions,
  postFxEffectDefinitionMap,
  type PostFXControlDefinition,
} from "@/config/post-fx/definitions";
import { postFxPresets } from "@/config/post-fx/presets";
import { useEditor } from "@/context/editor-context";
import { loadUserPostFXPresets, saveUserPostFXPreset } from "@/lib/post-fx-presets";
import {
  createPostFXEffect,
  deletePostFXEffect,
  duplicatePostFXEffect,
  getPostFXEffectDisplayName,
  hasExportOnlyEffects,
  insertPostFXEffectAfter,
  isPostFXEffectAtDefaults,
  isPreviewQualityReduced,
  movePostFXEffectToIndex,
  resetPostFXEffect,
  updatePostFXEffect,
} from "@/lib/post-fx";
import { cn } from "@/lib/utils";
import type {
  ExportFXQuality,
  PostFXEffect,
  PostFXEffectType,
  PostFXQuality,
  PostFXSettings,
} from "@/types/post-fx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  ChevronDown,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  GripVertical,
  MoreHorizontal,
  Pencil,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

type PostFXPanelProps = {
  className?: string;
};

function PanelShell({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <aside
      className={cn("flex h-full w-full min-w-0 flex-col border-l border-border bg-card", className)}
    >
      <div className="flex shrink-0 items-start gap-2 border-b border-border px-3 py-2.5">
        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <h2 className="truncate text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Post FX
          </h2>
          <p className="mt-0.5 truncate text-sm font-medium text-foreground">
            Composition effects
          </p>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </aside>
  );
}

function PostFXControlField({
  control,
  value,
  onChange,
}: {
  control: PostFXControlDefinition;
  value: number | string | boolean | undefined;
  onChange: (value: number | string | boolean) => void;
}) {
  if (control.type === "toggle") {
    const checked = Boolean(value);
    return (
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs">{control.label}</Label>
        <Button
          type="button"
          size="sm"
          variant={checked ? "default" : "outline"}
          className="h-7 text-[10px]"
          onClick={() => onChange(!checked)}
        >
          {checked ? "On" : "Off"}
        </Button>
      </div>
    );
  }

  if (control.type === "color") {
    const colorValue = String(value ?? "#000000");
    return (
      <div className="space-y-1.5">
        <Label className="text-xs">{control.label}</Label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={colorValue}
            onChange={(event) => onChange(event.target.value)}
            className="h-8 w-10 shrink-0 cursor-pointer rounded border border-input bg-background p-0.5"
          />
          <Input
            value={colorValue}
            className="h-8 font-mono text-xs"
            onChange={(event) => onChange(event.target.value)}
          />
        </div>
      </div>
    );
  }

  if (control.type === "select" && control.options) {
    return (
      <div className="space-y-1.5">
        <Label className="text-xs">{control.label}</Label>
        <Select value={String(value ?? control.options[0]?.value)} onValueChange={onChange}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {control.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  const numericValue = Number(value ?? control.min ?? 0);
  const min = control.min ?? 0;
  const max = control.max ?? 100;
  const step = control.step ?? 1;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs">{control.label}</Label>
        <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
          {numericValue}
          {control.unit ?? ""}
        </span>
      </div>
      <Slider
        value={[numericValue]}
        min={min}
        max={max}
        step={step}
        onValueChange={([next]) => onChange(next)}
      />
    </div>
  );
}

function DeleteEffectDialog({
  effectName,
  onKeep,
  onDelete,
}: {
  effectName: string;
  onKeep: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="w-full max-w-sm rounded-lg border border-border bg-card p-4 shadow-xl"
        role="dialog"
        aria-labelledby="delete-effect-title"
        aria-modal="true"
      >
        <h3 id="delete-effect-title" className="text-sm font-semibold text-foreground">
          Delete {effectName}?
        </h3>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Delete this effect? This will remove its settings from the stack.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onKeep}>
            Keep effect
          </Button>
          <Button type="button" variant="outline" size="sm" className="text-destructive" onClick={onDelete}>
            Delete effect
          </Button>
        </div>
      </div>
    </div>
  );
}

function EffectMoreMenu({
  onRename,
  onDuplicate,
  onReset,
  onDelete,
}: {
  onRename: () => void;
  onDuplicate: () => void;
  onReset: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    return () => window.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  return (
    <div ref={menuRef} className="relative">
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="h-7 w-7"
        aria-label="More actions"
        onClick={() => setOpen((prev) => !prev)}
      >
        <MoreHorizontal className="h-3.5 w-3.5" />
      </Button>
      {open ? (
        <div className="absolute right-0 top-full z-20 mt-1 min-w-[140px] rounded-md border border-border bg-card py-1 shadow-lg">
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs hover:bg-muted"
            onClick={() => {
              setOpen(false);
              onRename();
            }}
          >
            <Pencil className="h-3 w-3" />
            Rename
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs hover:bg-muted"
            onClick={() => {
              setOpen(false);
              onDuplicate();
            }}
          >
            <Copy className="h-3 w-3" />
            Duplicate
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs hover:bg-muted"
            onClick={() => {
              setOpen(false);
              onReset();
            }}
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs text-destructive hover:bg-muted"
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </button>
        </div>
      ) : null}
    </div>
  );
}

function AddPostFXControls({
  addEffectType,
  onTypeChange,
  onAdd,
}: {
  addEffectType: PostFXEffectType;
  onTypeChange: (type: PostFXEffectType) => void;
  onAdd: () => void;
}) {
  return (
    <div className="flex gap-2">
      <Select value={addEffectType} onValueChange={(value) => onTypeChange(value as PostFXEffectType)}>
        <SelectTrigger className="h-8 flex-1 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {postFxEffectDefinitions.map((definition) => (
            <SelectItem key={definition.type} value={definition.type}>
              {definition.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="button" size="sm" variant="outline" className="h-8 shrink-0 text-xs" onClick={onAdd}>
        <Plus className="mr-1 h-3.5 w-3.5" />
        Add Post FX
      </Button>
    </div>
  );
}

function EffectStackRow({
  effect,
  isDragOver,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onUpdate,
  onDuplicate,
  onReset,
  onDelete,
  onToggleSolo,
}: {
  effect: PostFXEffect;
  isDragOver: boolean;
  onDragStart: () => void;
  onDragOver: (event: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: () => void;
  onUpdate: (updater: (current: PostFXEffect) => PostFXEffect) => void;
  onDuplicate: () => void;
  onReset: () => void;
  onDelete: () => void;
  onToggleSolo: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const definition = postFxEffectDefinitionMap[effect.type];
  const displayName = getPostFXEffectDisplayName(effect);
  const simpleControls = definition.controls.filter((control) => !control.advanced);
  const advancedControls = definition.controls.filter((control) => control.advanced);

  return (
    <div
      className={cn(
        "rounded-md border border-border bg-background/40",
        effect.solo && "border-primary/50 bg-primary/5",
        !effect.enabled && "opacity-60",
        isDragOver && "border-primary/40 ring-1 ring-primary/20",
      )}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="flex items-center gap-1 p-2">
        <button
          type="button"
          className="flex h-7 w-6 shrink-0 cursor-grab items-center justify-center text-muted-foreground active:cursor-grabbing"
          draggable
          onDragStart={(event) => {
            event.dataTransfer.effectAllowed = "move";
            onDragStart();
          }}
          aria-label={`Reorder ${displayName}`}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>

        <button
          type="button"
          className="flex h-7 w-6 shrink-0 items-center justify-center text-muted-foreground"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          aria-label={expanded ? "Collapse effect" : "Expand effect"}
        >
          {expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium">{displayName}</p>
        </div>

        <Button
          type="button"
          size="sm"
          variant={effect.enabled ? "default" : "outline"}
          className="h-7 shrink-0 px-2 text-[10px]"
          onClick={() => onUpdate((current) => ({ ...current, enabled: !current.enabled }))}
          aria-label={effect.enabled ? `Disable ${displayName}` : `Enable ${displayName}`}
        >
          {effect.enabled ? "On" : "Off"}
        </Button>

        <EffectMoreMenu
          onRename={() => {
            const nextName = window.prompt("Effect name", displayName);
            if (nextName === null) return;
            onUpdate((current) => ({
              ...current,
              name: nextName.trim() || undefined,
            }));
          }}
          onDuplicate={onDuplicate}
          onReset={onReset}
          onDelete={onDelete}
        />
      </div>

      {expanded ? (
        <div className="space-y-3 border-t border-border px-2.5 pb-2.5 pt-2">
          <div className="flex flex-wrap gap-1">
            <Button
              type="button"
              size="sm"
              variant={effect.solo ? "default" : "outline"}
              className="h-7 text-[10px]"
              onClick={onToggleSolo}
            >
              {effect.solo ? <Eye className="mr-1 h-3 w-3" /> : <EyeOff className="mr-1 h-3 w-3" />}
              Solo
            </Button>
            {definition.supportsExportOnly ? (
              <Button
                type="button"
                size="sm"
                variant={effect.exportOnly ? "default" : "outline"}
                className="h-7 text-[10px]"
                onClick={() =>
                  onUpdate((current) => ({ ...current, exportOnly: !current.exportOnly }))
                }
              >
                Export only
              </Button>
            ) : null}
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 text-[10px]"
              onClick={onReset}
            >
              <RotateCcw className="mr-1 h-3 w-3" />
              Reset
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 text-[10px] text-destructive hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="mr-1 h-3 w-3" />
              Delete
            </Button>
          </div>

          {effect.enabled ? (
            <div className="space-y-3">
              {simpleControls.map((control) => (
                <PostFXControlField
                  key={control.id}
                  control={control}
                  value={effect.settings[control.id]}
                  onChange={(value) =>
                    onUpdate((current) => ({
                      ...current,
                      settings: { ...current.settings, [control.id]: value },
                    }))
                  }
                />
              ))}

              {advancedControls.length > 0 ? (
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-[10px] text-muted-foreground"
                    onClick={() => setShowAdvanced((prev) => !prev)}
                  >
                    {showAdvanced ? "Hide advanced" : "Show advanced"}
                  </Button>
                  {showAdvanced
                    ? advancedControls.map((control) => (
                        <PostFXControlField
                          key={control.id}
                          control={control}
                          value={effect.settings[control.id]}
                          onChange={(value) =>
                            onUpdate((current) => ({
                              ...current,
                              settings: { ...current.settings, [control.id]: value },
                            }))
                          }
                        />
                      ))
                    : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function PostFXPanel({ className }: PostFXPanelProps) {
  const { postFx, updatePostFX, applyPostFXPreset, undo, showToast } = useEditor();
  const [addEffectType, setAddEffectType] = useState<PostFXEffectType>("vignette");
  const [userPresets, setUserPresets] = useState(() => loadUserPostFXPresets());
  const [draggedEffectId, setDraggedEffectId] = useState<string | null>(null);
  const [dragOverEffectId, setDragOverEffectId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PostFXEffect | null>(null);
  const allPresets = useMemo(() => [...userPresets, ...postFxPresets], [userPresets]);

  const showReducedPreviewNotice = useMemo(
    () => isPreviewQualityReduced(postFx) || hasExportOnlyEffects(postFx),
    [postFx],
  );

  const updateSettings = (updater: (current: PostFXSettings) => PostFXSettings) => {
    updatePostFX(updater(postFx));
  };

  const handleAddEffect = () => {
    updateSettings((current) => ({
      ...current,
      enabled: true,
      effects: [...current.effects, createPostFXEffect(addEffectType)],
    }));
  };

  const performDelete = (effect: PostFXEffect) => {
    const effectName = getPostFXEffectDisplayName(effect);
    updateSettings((current) => ({
      ...current,
      effects: deletePostFXEffect(current.effects, effect.id),
    }));
    showToast({
      message: `${effectName} removed`,
      action: {
        label: "Undo",
        onClick: undo,
      },
    });
  };

  const requestDelete = (effect: PostFXEffect) => {
    if (isPostFXEffectAtDefaults(effect)) {
      performDelete(effect);
      return;
    }
    setPendingDelete(effect);
  };

  return (
    <PanelShell className={className}>
      {pendingDelete ? (
        <DeleteEffectDialog
          effectName={getPostFXEffectDisplayName(pendingDelete)}
          onKeep={() => setPendingDelete(null)}
          onDelete={() => {
            performDelete(pendingDelete);
            setPendingDelete(null);
          }}
        />
      ) : null}

      <div className="space-y-3 p-3">
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Post FX</Label>
          <Button
            type="button"
            size="sm"
            variant={postFx.enabled ? "default" : "outline"}
            className="ml-auto h-7 shrink-0 px-2.5 text-[10px]"
            onClick={() => updateSettings((current) => ({ ...current, enabled: !current.enabled }))}
          >
            {postFx.enabled ? "On" : "Off"}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label className="text-[10px] text-muted-foreground">Preview quality</Label>
            <Select
              value={postFx.previewQuality}
              onValueChange={(value) =>
                updateSettings((current) => ({
                  ...current,
                  previewQuality: value as PostFXQuality,
                }))
              }
            >
              <SelectTrigger className="h-8 text-xs capitalize">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["auto", "off", "low", "medium", "high"] as PostFXQuality[]).map((quality) => (
                  <SelectItem key={quality} value={quality} className="capitalize">
                    {quality}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] text-muted-foreground">Export quality</Label>
            <Select
              value={postFx.exportQuality}
              onValueChange={(value) =>
                updateSettings((current) => ({
                  ...current,
                  exportQuality: value as ExportFXQuality,
                }))
              }
            >
              <SelectTrigger className="h-8 text-xs capitalize">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["standard", "high", "max"] as ExportFXQuality[]).map((quality) => (
                  <SelectItem key={quality} value={quality} className="capitalize">
                    {quality}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {showReducedPreviewNotice ? (
          <p className="rounded-md border border-border bg-muted/30 px-2.5 py-2 text-[10px] leading-relaxed text-muted-foreground">
            Some effects are previewed at lower quality to keep editing smooth. Final export will
            render at full quality.
          </p>
        ) : null}

        <div className="space-y-1.5">
          <Label className="text-[10px] text-muted-foreground">Presets</Label>
          <div className="flex gap-2">
            <Select
              onValueChange={(presetId) => {
                const preset = allPresets.find((item) => item.id === presetId);
                if (preset) applyPostFXPreset(preset.settings);
              }}
            >
              <SelectTrigger className="h-8 flex-1 text-xs">
                <SelectValue placeholder="Apply preset…" />
              </SelectTrigger>
              <SelectContent>
                {allPresets.map((preset) => (
                  <SelectItem key={preset.id} value={preset.id}>
                    {preset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 shrink-0 text-xs"
              onClick={() => {
                const name = window.prompt("Preset name", "My Post FX");
                if (!name?.trim()) return;
                const saved = saveUserPostFXPreset(name.trim(), postFx);
                setUserPresets((current) => [saved, ...current.filter((item) => item.id !== saved.id)]);
              }}
            >
              Save
            </Button>
          </div>
        </div>

        <div className="space-y-2 rounded-md border border-border p-3">
          <div className="flex items-center justify-between gap-2">
            <Label className="text-xs text-muted-foreground">Effect stack</Label>
            <span className="text-[10px] tabular-nums text-muted-foreground">
              {postFx.effects.length}
            </span>
          </div>

          {postFx.effects.length > 0 ? (
            <AddPostFXControls
              addEffectType={addEffectType}
              onTypeChange={setAddEffectType}
              onAdd={handleAddEffect}
            />
          ) : null}

          {postFx.effects.length === 0 ? (
            <div className="space-y-3 rounded-md border border-dashed border-border px-3 py-4 text-center">
              <div className="space-y-1">
                <p className="text-xs font-medium text-foreground">No Post FX added.</p>
                <p className="text-[10px] leading-relaxed text-muted-foreground">
                  Add effects like grain, glow, vignette, and color grade to style the full video.
                </p>
              </div>
              <AddPostFXControls
                addEffectType={addEffectType}
                onTypeChange={setAddEffectType}
                onAdd={handleAddEffect}
              />
            </div>
          ) : (
            <div className="space-y-2">
              {postFx.effects.map((effect) => (
                <EffectStackRow
                  key={effect.id}
                  effect={effect}
                  isDragOver={dragOverEffectId === effect.id && draggedEffectId !== effect.id}
                  onDragStart={() => setDraggedEffectId(effect.id)}
                  onDragOver={(event) => {
                    event.preventDefault();
                    if (draggedEffectId && draggedEffectId !== effect.id) {
                      setDragOverEffectId(effect.id);
                    }
                  }}
                  onDragLeave={() => {
                    if (dragOverEffectId === effect.id) {
                      setDragOverEffectId(null);
                    }
                  }}
                  onDrop={() => {
                    if (!draggedEffectId || draggedEffectId === effect.id) return;
                    const fromIndex = postFx.effects.findIndex((item) => item.id === draggedEffectId);
                    const toIndex = postFx.effects.findIndex((item) => item.id === effect.id);
                    if (fromIndex < 0 || toIndex < 0) return;

                    updateSettings((current) => ({
                      ...current,
                      effects: movePostFXEffectToIndex(current.effects, fromIndex, toIndex),
                    }));
                    setDraggedEffectId(null);
                    setDragOverEffectId(null);
                  }}
                  onUpdate={(updater) =>
                    updateSettings((current) => ({
                      ...current,
                      effects: updatePostFXEffect(current.effects, effect.id, updater),
                    }))
                  }
                  onDuplicate={() =>
                    updateSettings((current) => ({
                      ...current,
                      enabled: true,
                      effects: insertPostFXEffectAfter(
                        current.effects,
                        effect.id,
                        duplicatePostFXEffect(effect),
                      ),
                    }))
                  }
                  onReset={() =>
                    updateSettings((current) => ({
                      ...current,
                      effects: updatePostFXEffect(current.effects, effect.id, resetPostFXEffect),
                    }))
                  }
                  onDelete={() => requestDelete(effect)}
                  onToggleSolo={() =>
                    updateSettings((current) => ({
                      ...current,
                      effects: current.effects.map((item) =>
                        item.id === effect.id
                          ? { ...item, solo: !item.solo }
                          : { ...item, solo: false },
                      ),
                    }))
                  }
                />
              ))}
            </div>
          )}

          {postFx.effects.length > 0 ? (
            <AddPostFXControls
              addEffectType={addEffectType}
              onTypeChange={setAddEffectType}
              onAdd={handleAddEffect}
            />
          ) : null}
        </div>
      </div>
    </PanelShell>
  );
}
