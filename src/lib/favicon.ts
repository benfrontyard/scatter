import { scatterBrandAssets } from "@/config/scatter-colors";
import type { Theme } from "@/context/theme-context";

const FAVICON_ID = "scatter-favicon";

export function applyFavicon(theme: Theme) {
  const link = document.getElementById(FAVICON_ID) as HTMLLinkElement | null;
  if (!link) return;

  const src = theme === "dark" ? scatterBrandAssets.icon.dark : scatterBrandAssets.icon.light;
  if (link.href !== src) {
    link.href = src;
  }
}
