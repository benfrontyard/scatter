import type { MotionAspectRatio, MotionBlockLibraryEntry } from "@/types/motion-block-library";
import { Component, type ErrorInfo, type ReactNode } from "react";

export type PreviewDiagnostic = {
  id: string;
  label: string;
  severity: "error" | "warning" | "info";
};

type PreviewErrorBoundaryProps = {
  children: ReactNode;
  onError: (message: string) => void;
  onReset?: () => void;
};

type PreviewErrorBoundaryState = {
  error: string | null;
};

export class PreviewErrorBoundary extends Component<
  PreviewErrorBoundaryProps,
  PreviewErrorBoundaryState
> {
  state: PreviewErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): PreviewErrorBoundaryState {
    return { error: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError(`${error.message}${info.componentStack ? "" : ""}`);
  }

  componentDidUpdate(prevProps: PreviewErrorBoundaryProps) {
    if (prevProps.children !== this.props.children && this.state.error) {
      this.setState({ error: null });
      this.props.onReset?.();
    }
  }

  render() {
    if (this.state.error) {
      return null;
    }
    return this.props.children;
  }
}

export type PreviewDiagnosticsInput = {
  selectedBlock: MotionBlockLibraryEntry | null | undefined;
  aspectRatio: MotionAspectRatio;
  content: Record<string, string>;
  previewSize: { width: number; height: number } | null;
  format: { width: number; height: number } | undefined;
  usesProductionRenderer: boolean;
  forceFallbackRenderer: boolean;
  productionSequence: unknown | null;
  productionRendererError: string | null;
};

export function buildPreviewDiagnostics(input: PreviewDiagnosticsInput): PreviewDiagnostic[] {
  const diagnostics: PreviewDiagnostic[] = [];

  if (!input.selectedBlock) {
    diagnostics.push({
      id: "no-block",
      label: "No block selected",
      severity: "error",
    });
    return diagnostics;
  }

  const block = input.selectedBlock;

  if (!input.format) {
    diagnostics.push({
      id: "no-format",
      label: "Format not found for aspect ratio",
      severity: "error",
    });
  }

  if (!block.supportedFormats?.includes(input.aspectRatio)) {
    diagnostics.push({
      id: "unsupported-aspect",
      label: `Aspect ratio ${input.aspectRatio} is not in supported formats`,
      severity: "error",
    });
  }

  if (!block.layoutRules[input.aspectRatio]) {
    diagnostics.push({
      id: "missing-layout",
      label: `No layout rules for ${input.aspectRatio}`,
      severity: "error",
    });
  }

  for (const slot of block.slots.filter((s) => s.required)) {
    const value = input.content[slot.id];
    if (!value && slot.type === "text") {
      diagnostics.push({
        id: `missing-slot-${slot.id}`,
        label: `Required slot "${slot.label}" has no content`,
        severity: "warning",
      });
    }
  }

  if (!input.previewSize) {
    // Not measured yet — don't flag as error
  } else if (input.previewSize.width <= 0 || input.previewSize.height <= 0) {
    diagnostics.push({
      id: "zero-size",
      label: "Preview container has zero size",
      severity: "error",
    });
  }

  if (input.usesProductionRenderer && !input.forceFallbackRenderer) {
    if (!input.productionSequence) {
      diagnostics.push({
        id: "null-sequence",
        label: "Production renderer returned null sequence",
        severity: "error",
      });
    }
    if (input.productionRendererError) {
      diagnostics.push({
        id: "production-exception",
        label: `Production renderer exception: ${input.productionRendererError}`,
        severity: "error",
      });
    }
  }

  if (!input.usesProductionRenderer && !input.forceFallbackRenderer) {
    diagnostics.push({
      id: "fallback-renderer",
      label: "Using playground fallback renderer (no production bridge)",
      severity: "info",
    });
  }

  return diagnostics;
}

export function previewShouldRender(diagnostics: PreviewDiagnostic[]): boolean {
  return !diagnostics.some((d) => d.severity === "error");
}

export function getRendererLabel(
  usesProductionRenderer: boolean,
  forceFallbackRenderer: boolean,
): string {
  if (forceFallbackRenderer || !usesProductionRenderer) {
    return "Playground fallback";
  }
  return "Production (Canvas)";
}
