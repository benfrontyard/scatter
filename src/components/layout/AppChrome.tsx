import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type ScatterLogoProps = {
  size?: "sm" | "md";
  className?: string;
};

export function ScatterLogo({ size = "md", className }: ScatterLogoProps) {
  const dim = size === "sm" ? "h-7 w-7 rounded-md" : "h-8 w-8 rounded-lg";
  return (
    <div className={cn("flex shrink-0 items-center justify-center bg-foreground", dim, className)}>
      <div className="flex gap-0.5">
        <span className="h-1.5 w-1.5 rounded-full bg-background" />
        <span className="h-1 w-1 rounded-full bg-background/60" />
      </div>
    </div>
  );
}

type AppChromeProps = {
  leading?: ReactNode;
  center?: ReactNode;
  trailing?: ReactNode;
  className?: string;
};

export function AppChrome({ leading, center, trailing, className }: AppChromeProps) {
  return (
    <header
      className={cn(
        "flex h-12 shrink-0 items-center gap-3 border-b border-border bg-background px-4 sm:px-6",
        className,
      )}
    >
      {leading ? <div className="flex min-w-0 items-center gap-2">{leading}</div> : null}
      {center ? <div className="mx-auto flex min-w-0 items-center justify-center">{center}</div> : null}
      {trailing ? (
        <div className="ml-auto flex shrink-0 items-center gap-2">{trailing}</div>
      ) : null}
    </header>
  );
}
