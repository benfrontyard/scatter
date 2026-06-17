import { useEditor } from "@/context/editor-context";
import {
  downloadProjectJson,
  listRecentProjects,
  parseProjectJson,
} from "@/lib/project-storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Download, FolderOpen, Plus, Save, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function ProjectMenu() {
  const {
    sequence,
    isDirty,
    showProjectMenu,
    setShowProjectMenu,
    setProjectName,
    saveProject,
    newProject,
    loadProjectById,
    importProject,
    projectId,
    customBrands,
    assets,
  } = useEditor();

  const dialogRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [recent, setRecent] = useState(listRecentProjects());

  useEffect(() => {
    if (showProjectMenu) setRecent(listRecentProjects());
  }, [showProjectMenu]);

  useEffect(() => {
    if (!showProjectMenu) return;
    const onClick = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        setShowProjectMenu(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [showProjectMenu, setShowProjectMenu]);

  if (!showProjectMenu) return null;

  const handleNew = () => {
    if (isDirty) {
      const confirmed = window.confirm(
        "You have unsaved changes. Start a new project anyway?",
      );
      if (!confirmed) return;
    }
    newProject(true);
    setShowProjectMenu(false);
  };

  const handleSave = () => {
    saveProject();
    setRecent(listRecentProjects());
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const project = parseProjectJson(text);
      if (isDirty) {
        const confirmed = window.confirm(
          "You have unsaved changes. Import project anyway?",
        );
        if (!confirmed) return;
      }
      importProject(project);
      setShowProjectMenu(false);
    } catch {
      window.alert("Could not import project file.");
    }
    event.target.value = "";
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-16"
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-menu-title"
        className="w-full max-w-md rounded-lg border border-border bg-card shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 id="project-menu-title" className="text-sm font-semibold">
            Project
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setShowProjectMenu(false)}
            aria-label="Close project menu"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4 p-4">
          <div className="space-y-1.5">
            <Label htmlFor="project-name">Project name</Label>
            <Input
              id="project-name"
              value={sequence.name}
              onChange={(event) => setProjectName(event.target.value)}
              className="h-8"
            />
            {isDirty && (
              <p className="text-[10px] text-amber-400">Unsaved changes</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={handleNew}>
              <Plus className="h-3.5 w-3.5" />
              New
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="h-3.5 w-3.5" />
              Save
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                downloadProjectJson({
                  version: 1,
                  id: projectId,
                  name: sequence.name,
                  savedAt: new Date().toISOString(),
                  sequence,
                  customBrands,
                  assets,
                })
              }
            >
              <Download className="h-3.5 w-3.5" />
              Export JSON
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-3.5 w-3.5" />
              Import
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="sr-only"
              onChange={handleImport}
              aria-label="Import project JSON"
            />
          </div>

          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Recent projects</p>
            {recent.length === 0 ? (
              <p className="rounded-md border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
                No saved projects yet
              </p>
            ) : (
              <ul className="max-h-48 space-y-1 overflow-y-auto">
                {recent.map((entry) => (
                  <li key={entry.id}>
                    <button
                      type="button"
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-secondary",
                        entry.id === projectId && "bg-secondary ring-1 ring-border",
                      )}
                      onClick={() => {
                        if (isDirty) {
                          const confirmed = window.confirm(
                            "You have unsaved changes. Open another project anyway?",
                          );
                          if (!confirmed) return;
                        }
                        loadProjectById(entry.id);
                        setShowProjectMenu(false);
                      }}
                    >
                      <FolderOpen className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="min-w-0 flex-1 truncate">{entry.name}</span>
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {new Date(entry.savedAt).toLocaleDateString()}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
