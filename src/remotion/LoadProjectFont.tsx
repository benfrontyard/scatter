import { buildGoogleFontsCss2Url } from "@/lib/google-fonts";
import { continueRender, delayRender } from "remotion";
import { useEffect } from "react";

type LoadProjectFontProps = {
  families: string[];
};

export function LoadProjectFont({ families }: LoadProjectFontProps) {
  useEffect(() => {
    const uniqueFamilies = [...new Set(families.filter(Boolean))];
    if (uniqueFamilies.length === 0) return;

    const handles = uniqueFamilies.map((family) => delayRender(`Loading font: ${family}`));

    const finishAll = () => {
      for (const handle of handles) continueRender(handle);
    };

    let pending = uniqueFamilies.length;

    const onFamilyDone = () => {
      pending -= 1;
      if (pending <= 0) finishAll();
    };

    const cleanups: Array<() => void> = [];

    for (const family of uniqueFamilies) {
      const linkId = `remotion-google-font-${family.replace(/\s+/g, "-").toLowerCase()}`;
      const existing = document.getElementById(linkId) as HTMLLinkElement | null;

      if (existing) {
        if (existing.sheet) {
          onFamilyDone();
          continue;
        }
        const finish = () => onFamilyDone();
        existing.addEventListener("load", finish, { once: true });
        existing.addEventListener("error", finish, { once: true });
        cleanups.push(() => {
          existing.removeEventListener("load", finish);
          existing.removeEventListener("error", finish);
        });
        continue;
      }

      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = buildGoogleFontsCss2Url(family);
      const finish = () => onFamilyDone();
      link.addEventListener("load", finish, { once: true });
      link.addEventListener("error", finish, { once: true });
      document.head.appendChild(link);
      cleanups.push(() => {
        link.removeEventListener("load", finish);
        link.removeEventListener("error", finish);
      });
    }

    return () => {
      for (const cleanup of cleanups) cleanup();
      finishAll();
    };
  }, [families.join("|")]);

  return null;
}
