import { HomeHeader } from "@/components/home/HomeHeader";
import { RecentProjects } from "@/components/home/RecentProjects";
import { ExportHistoryList } from "@/components/home/ExportHistoryList";
import { Button } from "@/components/ui/button";
import { useEditor } from "@/context/editor-context";
import { listExportHistory } from "@/lib/export-history";
import { Download, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";

type HomeSection = "overview" | "exports";

export function HomeShell() {
  const { startCreateFlow, setShowBrandSystem } = useEditor();
  const [section, setSection] = useState<HomeSection>("overview");
  const exportCount = useMemo(() => listExportHistory().length, [section]);

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-background">
      <HomeHeader />

      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
          {section === "overview" ? (
            <>
              <section className="mb-12">
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  What video are you making?
                </h1>
                <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
                  Add a brief and brand kit — Scatter generates a polished first draft. Refine scenes,
                  then export variants.
                </p>

                <div className="mt-6">
                  <Button
                    size="lg"
                    className="h-11 gap-2 px-6"
                    onClick={() => startCreateFlow()}
                  >
                    <Sparkles className="h-4 w-4" />
                    Create video
                  </Button>
                </div>

                <p className="mt-4 flex flex-wrap items-center gap-x-1 gap-y-1 text-sm text-muted-foreground">
                  <span>Or</span>
                  <SecondaryLink onClick={() => startCreateFlow({ path: "template" })}>
                    start from a video recipe
                  </SecondaryLink>
                  <span>·</span>
                  <SecondaryLink onClick={() => startCreateFlow({ path: "scratch" })}>
                    blank canvas
                  </SecondaryLink>
                  <span>·</span>
                  <SecondaryLink onClick={() => startCreateFlow({ path: "duplicate" })}>
                    duplicate a project
                  </SecondaryLink>
                  <span>·</span>
                  <SecondaryLink onClick={() => setShowBrandSystem(true)}>
                    manage brand kits
                  </SecondaryLink>
                </p>
              </section>

              <section className="mb-10">
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Recent projects
                </h2>
                <RecentProjects />
              </section>

              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Export history
                  </h2>
                  {exportCount > 3 ? (
                    <button
                      type="button"
                      onClick={() => setSection("exports")}
                      className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                    >
                      View all ({exportCount})
                    </button>
                  ) : null}
                </div>
                <ExportHistoryList limit={3} />
              </section>
            </>
          ) : (
            <section>
              <button
                type="button"
                onClick={() => setSection("overview")}
                className="mb-6 text-sm text-muted-foreground hover:text-foreground"
              >
                ← Back to home
              </button>
              <div className="mb-6 flex items-center gap-2">
                <Download className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight">Export history</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Recent renders from your projects.
                  </p>
                </div>
              </div>
              <ExportHistoryList />
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

function SecondaryLink({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-foreground underline-offset-4 hover:underline"
    >
      {children}
    </button>
  );
}
