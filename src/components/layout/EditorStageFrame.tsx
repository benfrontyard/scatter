import { cn } from "@/lib/utils";
import type { CSSProperties, ReactNode } from "react";

type EditorStageFrameProps = {
  width?: number;
  height?: number;
  aspectRatio?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
};

/** Canvas preview frame — matches Canvas editor stage styling. */
export function EditorStageFrame({
  width,
  height,
  aspectRatio,
  className,
  style,
  children,
}: EditorStageFrameProps) {
  const frameStyle: CSSProperties = {
    ...(width && height ? { width, height } : {}),
    ...(aspectRatio && !width ? { width: "100%", maxWidth: 720, aspectRatio } : {}),
    ...style,
  };

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded border border-border bg-black shadow-lg",
        className,
      )}
      style={frameStyle}
    >
      {children}
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5" />
    </div>
  );
}

type EditorStageAreaProps = {
  className?: string;
  style?: React.CSSProperties;
  innerRef?: React.RefObject<HTMLDivElement | null>;
  children: ReactNode;
};

/** Centered preview surface — matches Canvas bg-preview-surface treatment. */
export function EditorStageArea({ className, style, innerRef, children }: EditorStageAreaProps) {
  return (
    <div
      ref={innerRef}
      style={style}
      className={cn(
        "flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-preview-surface p-3 sm:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}
