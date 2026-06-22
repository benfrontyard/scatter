import { ScatterBrandLogo } from "@/components/brand/ScatterBrandLogo";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type ScatterLogoProps = {
  size?: "sm" | "md";
  variant?: "icon" | "lockup";
  className?: string;
};

export function ScatterLogo({ size = "md", variant = "icon", className }: ScatterLogoProps) {
  return <ScatterBrandLogo variant={variant} size={size} className={className} />;
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
