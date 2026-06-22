import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type EditorShellMode = "canvas" | "studio";

export type EditorShellProps = {
  mode?: EditorShellMode;
  /** When true, fills viewport as a fixed overlay (Studio). */
  overlay?: boolean;
  /** When true, fills parent height instead of viewport (nested workspace). */
  embedded?: boolean;
  className?: string;
  topBar?: ReactNode;
  notificationBanner?: ReactNode;
  projectMeta?: ReactNode;
  leftPanel?: ReactNode;
  centerStage?: ReactNode;
  rightRail?: ReactNode;
  inspectorPanel?: ReactNode;
  bottomPanel?: ReactNode;
  /** Main content area when not using slot-based workspace layout. */
  children?: ReactNode;
};

export function EditorShell({
  mode = "canvas",
  overlay = false,
  embedded = false,
  className,
  topBar,
  notificationBanner,
  projectMeta,
  leftPanel,
  centerStage,
  rightRail,
  inspectorPanel,
  bottomPanel,
  children,
}: EditorShellProps) {
  const hasSidePanels = Boolean(leftPanel || inspectorPanel);
  const hasWorkspace = Boolean(centerStage || hasSidePanels);

  return (
    <div
      data-editor-shell={mode}
      className={cn(
        "flex flex-col overflow-hidden bg-background text-foreground",
        embedded
          ? "h-full min-h-0"
          : overlay
            ? "fixed inset-0 z-50 h-dvh"
            : "h-dvh max-w-[100vw]",
        className,
      )}
    >
      {topBar}

      {notificationBanner}

      {projectMeta}

      {hasWorkspace ? (
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="relative flex min-h-0 min-w-0 flex-1 overflow-hidden">
            {leftPanel ? (
              <aside
                className="flex shrink-0 flex-col overflow-hidden border-r border-border bg-card"
                style={{ width: "var(--editor-sidebar-width)" }}
              >
                {leftPanel}
              </aside>
            ) : null}

            <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
              {centerStage}
              {rightRail}
            </div>

            {inspectorPanel ? (
              <aside
                className="flex shrink-0 flex-col overflow-hidden border-l border-border bg-card"
                style={{ width: "var(--editor-inspector-width)" }}
              >
                {inspectorPanel}
              </aside>
            ) : null}
          </div>

          {bottomPanel}
        </div>
      ) : children ? (
        <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
      ) : null}

      {/* Overlays/modals — must not participate in flex layout */}
      {hasWorkspace ? children : null}
    </div>
  );
}
