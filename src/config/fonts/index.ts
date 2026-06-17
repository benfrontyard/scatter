export type FontCategory = "sans" | "serif";

export type CuratedFont = {
  family: string;
  category: FontCategory;
};

export const fontGroups = [
  {
    label: "Clean UI",
    fonts: [
      "Inter",
      "Manrope",
      "DM Sans",
      "IBM Plex Sans",
      "Work Sans",
      "Source Sans 3",
      "Fira Sans",
      "Open Sans",
      "Lato",
      "Roboto",
      "Montserrat",
      "Archivo",
    ],
  },
  {
    label: "Editorial Serif",
    fonts: [
      "Instrument Serif",
      "Lora",
      "Playfair Display",
      "Fraunces",
      "Newsreader",
      "Libre Baskerville",
      "Crimson Pro",
      "Alegreya",
      "Merriweather",
    ],
  },
  {
    label: "Display",
    fonts: ["Bebas Neue", "Anton", "Archivo Black", "Abril Fatface", "Bodoni Moda", "Oswald"],
  },
  {
    label: "Slab / Retro",
    fonts: ["Roboto Slab", "Arvo", "Bitter"],
  },
] as const;

const serifFamilies = new Set<string>([
  "Instrument Serif",
  "Lora",
  "Playfair Display",
  "Fraunces",
  "Newsreader",
  "Libre Baskerville",
  "Crimson Pro",
  "Alegreya",
  "Merriweather",
  "Roboto Slab",
  "Arvo",
  "Bitter",
  "Bodoni Moda",
  "Abril Fatface",
]);

export const curatedFonts: CuratedFont[] = fontGroups.flatMap((group) =>
  group.fonts.map((family) => ({
    family,
    category: serifFamilies.has(family) ? "serif" : "sans",
  })),
);

export const curatedFontFamilies = curatedFonts.map((font) => font.family);

export const defaultProjectFont = "Inter";

const fontCategoryMap = new Map(curatedFonts.map((font) => [font.family, font.category]));

export function getFontCategory(family: string): FontCategory {
  return fontCategoryMap.get(family) ?? "sans";
}

export function isCuratedFont(family: string): boolean {
  return fontCategoryMap.has(family);
}
