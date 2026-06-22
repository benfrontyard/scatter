import { listRecentProjects } from "@/lib/project-storage";
import { useEditor } from "@/context/editor-context";
import { Clock, FolderOpen } from "lucide-react";
import { useMemo } from "react";

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function RecentProjects() {
  const { openProjectInEditor } = useEditor();
  const recent = useMemo(() => listRecentProjects(), []);

  if (recent.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-10 text-center">
        <FolderOpen className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">No projects yet. Create your first video to get started.</p>
      </div>
    );
  }

  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {recent.map((project) => (
        <li key={project.id}>
          <button
            type="button"
            onClick={() => openProjectInEditor(project.id)}
            className="group flex w-full items-start gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-foreground/20 hover:bg-secondary/30"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground group-hover:text-foreground">
              <FolderOpen className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{project.name}</p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatRelativeTime(project.savedAt)}
              </p>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}
