import { useCallback, useEffect, useState } from "react";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function readStoredWidth(key: string, fallback: number, min: number, max: number): number {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = window.localStorage.getItem(key);
    if (!stored) return fallback;
    const parsed = Number(stored);
    if (Number.isNaN(parsed)) return fallback;
    return clamp(parsed, min, max);
  } catch {
    return fallback;
  }
}

type PanelBounds = {
  defaultWidth: number;
  minWidth: number;
  maxWidth: number;
};

type UseResizablePanelsOptions = {
  left: PanelBounds;
  right: PanelBounds;
  leftStorageKey?: string;
  rightStorageKey?: string;
};

export function useResizablePanels({
  left,
  right,
  leftStorageKey = "scatter:panel-width:left",
  rightStorageKey = "scatter:panel-width:right",
}: UseResizablePanelsOptions) {
  const [leftWidth, setLeftWidth] = useState(() =>
    readStoredWidth(leftStorageKey, left.defaultWidth, left.minWidth, left.maxWidth),
  );
  const [rightWidth, setRightWidth] = useState(() =>
    readStoredWidth(rightStorageKey, right.defaultWidth, right.minWidth, right.maxWidth),
  );
  const [resizing, setResizing] = useState<"left" | "right" | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(leftStorageKey, String(leftWidth));
    } catch {
      // ignore storage failures
    }
  }, [leftStorageKey, leftWidth]);

  useEffect(() => {
    try {
      window.localStorage.setItem(rightStorageKey, String(rightWidth));
    } catch {
      // ignore storage failures
    }
  }, [rightStorageKey, rightWidth]);

  const resizeLeft = useCallback(
    (startX: number, startWidth: number, clientX: number) => {
      const next = clamp(startWidth + (clientX - startX), left.minWidth, left.maxWidth);
      setLeftWidth(next);
    },
    [left.maxWidth, left.minWidth],
  );

  const resizeRight = useCallback(
    (startX: number, startWidth: number, clientX: number) => {
      const next = clamp(startWidth - (clientX - startX), right.minWidth, right.maxWidth);
      setRightWidth(next);
    },
    [right.maxWidth, right.minWidth],
  );

  const beginResize = useCallback(
    (panel: "left" | "right", startX: number) => {
      setResizing(panel);
      const startWidth = panel === "left" ? leftWidth : rightWidth;
      const onMove = (event: PointerEvent) => {
        if (panel === "left") {
          resizeLeft(startX, startWidth, event.clientX);
        } else {
          resizeRight(startX, startWidth, event.clientX);
        }
      };
      const onUp = () => {
        setResizing(null);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
    },
    [leftWidth, resizeLeft, resizeRight, rightWidth],
  );

  return {
    leftWidth,
    rightWidth,
    resizing,
    beginResize,
  };
}
