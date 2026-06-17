import { curatedFontFamilies, fontGroups } from "@/config/fonts";
import { filterCuratedFonts, getValidatedGoogleFontFamilies } from "@/lib/google-fonts";
import { useEffect, useState } from "react";

export type FontGroupOption = {
  label: string;
  fonts: string[];
};

export function useAvailableFonts(): FontGroupOption[] {
  const [groups, setGroups] = useState<FontGroupOption[]>(
    fontGroups.map((group) => ({ label: group.label, fonts: [...group.fonts] })),
  );

  useEffect(() => {
    let cancelled = false;

    void getValidatedGoogleFontFamilies(curatedFontFamilies).then((validated) => {
      if (cancelled) return;
      const allowed = new Set(filterCuratedFonts(curatedFontFamilies, validated));
      setGroups(
        fontGroups
          .map((group) => ({
            label: group.label,
            fonts: group.fonts.filter((family) => allowed.has(family)),
          }))
          .filter((group) => group.fonts.length > 0),
      );
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return groups;
}
