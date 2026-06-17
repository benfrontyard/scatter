import { buildGoogleFontsCss2Url } from "@/lib/google-fonts";
import { continueRender, delayRender } from "remotion";
import { useEffect } from "react";

type LoadProjectFontProps = {
  family?: string;
};

export function LoadProjectFont({ family }: LoadProjectFontProps) {
  useEffect(() => {
    if (!family) return;

    const handle = delayRender(`Loading font: ${family}`);
    const linkId = `remotion-google-font-${family.replace(/\s+/g, "-").toLowerCase()}`;
    const existing = document.getElementById(linkId) as HTMLLinkElement | null;

    const finish = () => continueRender(handle);

    if (existing) {
      if (existing.sheet) {
        finish();
        return;
      }
      existing.addEventListener("load", finish, { once: true });
      existing.addEventListener("error", finish, { once: true });
      return () => {
        existing.removeEventListener("load", finish);
        existing.removeEventListener("error", finish);
        continueRender(handle);
      };
    }

    const link = document.createElement("link");
    link.id = linkId;
    link.rel = "stylesheet";
    link.href = buildGoogleFontsCss2Url(family);
    link.addEventListener("load", finish, { once: true });
    link.addEventListener("error", finish, { once: true });
    document.head.appendChild(link);

    return () => {
      link.removeEventListener("load", finish);
      link.removeEventListener("error", finish);
      continueRender(handle);
    };
  }, [family]);

  return null;
}
