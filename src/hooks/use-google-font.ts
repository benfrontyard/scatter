import { useEffect } from "react";
import { loadGoogleFont } from "@/lib/google-fonts";

export function useGoogleFont(family: string | undefined): void {
  useEffect(() => {
    if (!family) return;
    loadGoogleFont(family);
  }, [family]);
}
