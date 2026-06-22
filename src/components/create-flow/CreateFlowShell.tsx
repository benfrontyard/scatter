import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AppChrome } from "@/components/layout/AppChrome";
import { exampleBrandKits } from "@/lib/brand-motion-kit-integration";
import { motionFormats } from "@/config/formats";
import {
  getCreateFlowSteps,
  getCreateFlowSummary,
  getCreatePathLabel,
} from "@/lib/create-flow-steps";
import { listRecentProjects } from "@/lib/project-storage";
import { getRecipesForPath, videoRecipes } from "@/lib/video-recipes";
import { useEditor } from "@/context/editor-context";
import type { CreatePath } from "@/types/editor";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  FileText,
  LayoutTemplate,
  PenLine,
  Sparkles,
} from "lucide-react";
import { useMemo } from "react";

const PATH_OPTIONS: {
  id: CreatePath;
  title: string;
  description: string;
  icon: typeof Sparkles;
}[] = [
  {
    id: "brief",
    title: "From brief / script",
    description: "Paste marketing copy and we'll structure scenes around it.",
    icon: FileText,
  },
  {
    id: "template",
    title: "From video recipe",
    description: "Choose a proven scene sequence with content slots and timing.",
    icon: LayoutTemplate,
  },
  {
    id: "scratch",
    title: "Blank canvas",
    description: "Empty timeline — add scenes manually in the editor.",
    icon: PenLine,
  },
  {
    id: "duplicate",
    title: "Duplicate project",
    description: "Copy an existing project as your starting point.",
    icon: Copy,
  },
];

export function CreateFlowShell() {
  const {
    createFlowDraft,
    createFlowStep,
    setCreateFlowStep,
    goHome,
    completeCreateFlow,
  } = useEditor();

  const activeSteps = useMemo(() => {
    if (createFlowStep === "path") {
      return getCreateFlowSteps(null);
    }
    return getCreateFlowSteps(createFlowDraft.path);
  }, [createFlowDraft.path, createFlowStep]);

  const stepIndex = activeSteps.findIndex((s) => s.id === createFlowStep);
  const isFirst = stepIndex <= 0;
  const isLast = stepIndex >= activeSteps.length - 1;
  const summary = getCreateFlowSummary(createFlowDraft);

  const canContinue = useMemo(() => {
    switch (createFlowStep) {
      case "path":
        return createFlowDraft.path !== null;
      case "brand":
        return createFlowDraft.brandKitId !== null;
      case "content":
        return (
          createFlowDraft.path === "scratch" ||
          createFlowDraft.brief.trim().length > 0 ||
          createFlowDraft.projectName.trim().length > 0
        );
      case "recipe":
        if (createFlowDraft.path === "duplicate") {
          return createFlowDraft.sourceProjectId !== null;
        }
        return (
          createFlowDraft.recipeId !== null ||
          createFlowDraft.path === "scratch"
        );
      case "formats":
        return createFlowDraft.formatIds.length > 0;
      case "generate":
        return true;
      default:
        return false;
    }
  }, [createFlowDraft, createFlowStep]);

  const goNext = () => {
    if (!canContinue) return;
    if (isLast) {
      completeCreateFlow();
      return;
    }
    const next = activeSteps[stepIndex + 1];
    if (next) setCreateFlowStep(next.id);
  };

  const goBack = () => {
    if (isFirst) {
      goHome();
      return;
    }
    const prev = activeSteps[stepIndex - 1];
    if (prev) setCreateFlowStep(prev.id);
  };

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-background">
      <AppChrome
        leading={
          <Button type="button" variant="ghost" size="sm" className="gap-1.5 -ml-2" onClick={goBack}>
            <ArrowLeft className="h-3.5 w-3.5" />
            {isFirst ? "Home" : "Back"}
          </Button>
        }
        center={
          <div className="hidden items-center gap-1 sm:flex">
            {activeSteps.map((step, index) => (
              <div key={step.id} className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    if (index <= stepIndex) setCreateFlowStep(step.id);
                  }}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider transition-colors",
                    createFlowStep === step.id
                      ? "bg-foreground text-background"
                      : index < stepIndex
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </button>
                {index < activeSteps.length - 1 ? (
                  <span className="text-muted-foreground/30">·</span>
                ) : null}
              </div>
            ))}
          </div>
        }
        trailing={
          <span className="text-xs text-muted-foreground sm:hidden">
            {stepIndex + 1} / {activeSteps.length}
          </span>
        }
      />

      {createFlowDraft.path && createFlowStep !== "path" ? (
        <div className="flex shrink-0 items-center justify-center gap-2 border-b border-border bg-muted/30 px-4 py-2">
          <span className="text-xs text-muted-foreground">
            {getCreatePathLabel(createFlowDraft.path)}
          </span>
          {summary ? (
            <>
              <span className="text-muted-foreground/40">·</span>
              <span className="truncate text-xs font-medium">{summary}</span>
            </>
          ) : null}
          <button
            type="button"
            onClick={() => setCreateFlowStep("path")}
            className="ml-1 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            Change
          </button>
        </div>
      ) : null}

      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
          {createFlowStep === "path" && <PathStep />}
          {createFlowStep === "brand" && <BrandStep />}
          {createFlowStep === "content" && <ContentStep />}
          {createFlowStep === "recipe" && <RecipeStep />}
          {createFlowStep === "formats" && <FormatsStep />}
          {createFlowStep === "generate" && <GenerateStep />}
        </div>
      </main>

      <footer className="flex shrink-0 items-center justify-between border-t border-border px-4 py-3 sm:px-6">
        <p className="text-xs text-muted-foreground">
          {activeSteps[stepIndex]?.label ?? "Create video"}
        </p>
        <Button type="button" className="gap-1.5" onClick={goNext} disabled={!canContinue}>
          {isLast ? (
            <>
              <Sparkles className="h-3.5 w-3.5" />
              Generate draft
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </Button>
      </footer>
    </div>
  );
}

function PathStep() {
  const { createFlowDraft, updateCreateFlowDraft, setCreateFlowStep } = useEditor();

  const selectPath = (path: CreatePath) => {
    updateCreateFlowDraft({
      path,
      recipeId:
        path === "scratch"
          ? "blank"
          : path === "template"
            ? "product-launch"
            : createFlowDraft.recipeId,
    });
    const nextSteps = getCreateFlowSteps(path);
    const first = nextSteps[0];
    if (first) setCreateFlowStep(first.id);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">How do you want to start?</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Choose a creation path. You can always refine scenes in the editor afterward.
      </p>
      <div className="mt-6 grid gap-3">
        {PATH_OPTIONS.map((option) => {
          const Icon = option.icon;
          const selected = createFlowDraft.path === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => selectPath(option.id)}
              className={cn(
                "flex items-start gap-4 rounded-xl border p-4 text-left transition-colors",
                selected
                  ? "border-foreground bg-secondary/50"
                  : "border-border bg-card hover:border-foreground/20",
              )}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">{option.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{option.description}</p>
              </div>
              {selected ? <Check className="ml-auto h-4 w-4 shrink-0 text-foreground" /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BrandStep() {
  const { createFlowDraft, updateCreateFlowDraft, allBrands } = useEditor();
  const kits = useMemo(() => {
    const descriptions = new Map(
      exampleBrandKits.map((k) => [k.id, k.description]),
    );
    return allBrands.map((brand) => ({
      id: brand.id,
      name: brand.name,
      description: descriptions.get(brand.id) ?? "Custom brand kit",
    }));
  }, [allBrands]);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Choose a brand kit</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Your brand kit drives colors, typography, motion, and transitions across every scene.
      </p>
      <div className="mt-6 grid gap-2">
        {kits.map((kit) => {
          const selected = createFlowDraft.brandKitId === kit.id;
          return (
            <button
              key={kit.id}
              type="button"
              onClick={() => updateCreateFlowDraft({ brandKitId: kit.id })}
              className={cn(
                "flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors",
                selected
                  ? "border-foreground bg-secondary/50"
                  : "border-border bg-card hover:border-foreground/20",
              )}
            >
              <div>
                <p className="text-sm font-medium">{kit.name}</p>
                <p className="text-xs text-muted-foreground">{kit.description}</p>
              </div>
              {selected ? <Check className="h-4 w-4 shrink-0" /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ContentStep() {
  const { createFlowDraft, updateCreateFlowDraft } = useEditor();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Add your content</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {createFlowDraft.path === "brief"
          ? "Paste your script or marketing brief. We'll use it to populate scene headlines."
          : "Name your project and optionally add a brief to guide scene content."}
      </p>
      <div className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="project-name">Project name</Label>
          <Input
            id="project-name"
            value={createFlowDraft.projectName}
            onChange={(e) => updateCreateFlowDraft({ projectName: e.target.value })}
            placeholder="e.g. Q3 product launch"
          />
        </div>
        {createFlowDraft.path !== "scratch" ? (
          <div className="space-y-2">
            <Label htmlFor="brief">Brief / script</Label>
            <Textarea
              id="brief"
              value={createFlowDraft.brief}
              onChange={(e) => updateCreateFlowDraft({ brief: e.target.value })}
              placeholder="Paste your marketing copy, voiceover script, or key messages…"
              rows={8}
              className="resize-y"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function RecipeStep() {
  const { createFlowDraft, updateCreateFlowDraft } = useEditor();
  const recent = useMemo(() => listRecentProjects(), []);

  if (createFlowDraft.path === "duplicate") {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Duplicate a project</h1>
        <p className="mt-2 text-sm text-muted-foreground">Select a project to copy.</p>
        <div className="mt-6 grid gap-2">
          {recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">No saved projects yet.</p>
          ) : (
            recent.map((project) => {
              const selected = createFlowDraft.sourceProjectId === project.id;
              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() =>
                    updateCreateFlowDraft({
                      sourceProjectId: project.id,
                      projectName: `${project.name} (copy)`,
                    })
                  }
                  className={cn(
                    "flex items-center justify-between rounded-xl border px-4 py-3 text-left",
                    selected ? "border-foreground bg-secondary/50" : "border-border bg-card",
                  )}
                >
                  <span className="text-sm font-medium">{project.name}</span>
                  {selected ? <Check className="h-4 w-4" /> : null}
                </button>
              );
            })
          )}
        </div>
      </div>
    );
  }

  const recipes = getRecipesForPath(createFlowDraft.path);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Choose a video recipe</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Recipes define scene sequence, content slots, durations, and transitions.
      </p>
      <div className="mt-6 grid gap-3">
        {recipes.map((recipe) => {
          const selected = createFlowDraft.recipeId === recipe.id;
          return (
            <button
              key={recipe.id}
              type="button"
              onClick={() =>
                updateCreateFlowDraft({
                  recipeId: recipe.id,
                  projectName: createFlowDraft.projectName || recipe.suggestedProjectName,
                })
              }
              className={cn(
                "rounded-xl border p-4 text-left transition-colors",
                selected ? "border-foreground bg-secondary/50" : "border-border bg-card",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{recipe.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{recipe.description}</p>
                </div>
                {selected ? <Check className="h-4 w-4 shrink-0" /> : null}
              </div>
              <p className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                {recipe.scenes.length} scenes · {recipe.useCase}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FormatsStep() {
  const { createFlowDraft, updateCreateFlowDraft } = useEditor();
  const recipe = videoRecipes.find((r) => r.id === createFlowDraft.recipeId);
  const compatible = recipe?.compatibleFormats ?? motionFormats.map((f) => f.id);

  const toggleFormat = (formatId: string) => {
    const current = createFlowDraft.formatIds;
    if (current.includes(formatId)) {
      if (current.length === 1) return;
      updateCreateFlowDraft({ formatIds: current.filter((id) => id !== formatId) });
    } else {
      updateCreateFlowDraft({ formatIds: [...current, formatId] });
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Choose format variants</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Select the aspect ratios you need. The primary format opens in the editor; export others from
        there.
      </p>
      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        {motionFormats
          .filter((f) => compatible.includes(f.id))
          .map((format) => {
            const selected = createFlowDraft.formatIds.includes(format.id);
            const isPrimary = createFlowDraft.formatIds[0] === format.id;
            return (
              <button
                key={format.id}
                type="button"
                onClick={() => toggleFormat(format.id)}
                className={cn(
                  "flex items-center justify-between rounded-xl border px-4 py-3 text-left",
                  selected ? "border-foreground bg-secondary/50" : "border-border bg-card opacity-60",
                )}
              >
                <div>
                  <p className="text-sm font-medium">{format.label}</p>
                  <p className="text-xs text-muted-foreground">{format.aspectRatio}</p>
                </div>
                <div className="flex items-center gap-2">
                  {isPrimary && selected ? (
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Primary
                    </span>
                  ) : null}
                  {selected ? <Check className="h-4 w-4" /> : null}
                </div>
              </button>
            );
          })}
      </div>
    </div>
  );
}

function GenerateStep() {
  const { createFlowDraft } = useEditor();
  const recipe = videoRecipes.find((r) => r.id === createFlowDraft.recipeId);
  const primaryFormat = motionFormats.find((f) => f.id === createFlowDraft.formatIds[0]);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Ready to generate</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Scatter will create a polished first draft. Refine scenes, timing, and brand in the editor.
      </p>
      <dl className="mt-6 space-y-3 rounded-xl border border-border bg-card p-4 text-sm">
        <SummaryRow label="Path" value={getCreatePathLabel(createFlowDraft.path)} />
        <SummaryRow
          label="Project"
          value={createFlowDraft.projectName || recipe?.suggestedProjectName || "Untitled video"}
        />
        <SummaryRow label="Brand kit" value={createFlowDraft.brandKitId ?? "—"} />
        <SummaryRow
          label="Recipe"
          value={recipe?.name ?? (createFlowDraft.path === "scratch" ? "Blank" : "—")}
        />
        <SummaryRow
          label="Scenes"
          value={
            recipe
              ? String(recipe.scenes.length)
              : createFlowDraft.path === "duplicate"
                ? "Copied"
                : "0"
          }
        />
        <SummaryRow label="Primary format" value={primaryFormat?.aspectRatio ?? "—"} />
        <SummaryRow
          label="Variants"
          value={createFlowDraft.formatIds
            .map((id) => motionFormats.find((f) => f.id === id)?.aspectRatio)
            .join(", ")}
        />
      </dl>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium capitalize">{value}</dd>
    </div>
  );
}
