import { scatterBrandAssets } from "@/config/scatter-colors";
import { useTheme } from "@/context/theme-context";
import { cn } from "@/lib/utils";

type ScatterBrandLogoProps = {
  variant?: "icon" | "lockup";
  size?: "sm" | "md";
  className?: string;
};

const iconHeights = { sm: 28, md: 32 } as const;
const lockupHeights = { sm: 28, md: 32 } as const;

export function ScatterBrandLogo({ variant = "icon", size = "md", className }: ScatterBrandLogoProps) {
  const { theme } = useTheme();
  const assets = variant === "lockup" ? scatterBrandAssets.logo : scatterBrandAssets.icon;
  const src = theme === "dark" ? assets.dark : assets.light;
  const height = variant === "lockup" ? lockupHeights[size] : iconHeights[size];

  return (
    <img
      src={src}
      alt={variant === "lockup" ? "Scatter" : ""}
      aria-hidden={variant === "icon" ? true : undefined}
      className={cn("shrink-0 w-auto object-contain", className)}
      style={{ height }}
      draggable={false}
    />
  );
}
