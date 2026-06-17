import { type FontCategory, getFontCategory } from "@/config/fonts";

const CSS2_BASE = "https://fonts.googleapis.com/css2";
const WEBFONTS_API = "https://www.googleapis.com/webfonts/v1/webfonts";

let validatedFamilies: Set<string> | null = null;
let validationPromise: Promise<Set<string>> | null = null;

export function buildGoogleFontsCss2Url(family: string): string {
  const encoded = encodeURIComponent(family.trim()).replace(/%20/g, "+");
  return `${CSS2_BASE}?family=${encoded}&display=swap`;
}

export function buildFontStack(family: string, category?: FontCategory): string {
  const resolvedCategory = category ?? getFontCategory(family);
  const quoted = `"${family}"`;
  return resolvedCategory === "serif"
    ? `${quoted}, Georgia, serif`
    : `${quoted}, system-ui, sans-serif`;
}

export function loadGoogleFont(family: string): void {
  if (typeof document === "undefined" || !family.trim()) return;

  const linkId = `google-font-${family.replace(/\s+/g, "-").toLowerCase()}`;
  if (document.getElementById(linkId)) return;

  const link = document.createElement("link");
  link.id = linkId;
  link.rel = "stylesheet";
  link.href = buildGoogleFontsCss2Url(family);
  document.head.appendChild(link);
}

export function unloadGoogleFont(family: string): void {
  if (typeof document === "undefined") return;
  const linkId = `google-font-${family.replace(/\s+/g, "-").toLowerCase()}`;
  document.getElementById(linkId)?.remove();
}

async function fetchValidatedGoogleFontFamilies(apiKey: string): Promise<Set<string>> {
  const url = new URL(WEBFONTS_API);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("sort", "popularity");

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Google Fonts API error: ${response.status}`);
  }

  const data = (await response.json()) as { items?: Array<{ family: string }> };
  return new Set((data.items ?? []).map((item) => item.family));
}

export async function getValidatedGoogleFontFamilies(
  curatedFamilies: readonly string[],
): Promise<Set<string>> {
  const apiKey = import.meta.env.VITE_GOOGLE_FONTS_API_KEY;
  if (!apiKey) {
    return new Set(curatedFamilies);
  }

  if (validatedFamilies) return validatedFamilies;
  if (!validationPromise) {
    validationPromise = fetchValidatedGoogleFontFamilies(apiKey)
      .then((families) => {
        validatedFamilies = families;
        return families;
      })
      .catch(() => {
        validatedFamilies = new Set(curatedFamilies);
        return validatedFamilies;
      });
  }

  return validationPromise;
}

export function filterCuratedFonts(
  curatedFamilies: readonly string[],
  validatedFamilies: Set<string>,
): string[] {
  const apiKey = import.meta.env.VITE_GOOGLE_FONTS_API_KEY;
  if (!apiKey) return [...curatedFamilies];
  return curatedFamilies.filter((family) => validatedFamilies.has(family));
}
