import { useCallback, useRef, useState } from "react";

const MAX_HISTORY = 50;

export type HistoryState<T> = {
  past: T[];
  present: T;
  future: T[];
};

export function useHistory<T>(initial: T) {
  const [state, setState] = useState<HistoryState<T>>({
    past: [],
    present: initial,
    future: [],
  });

  const skipNextPush = useRef(false);

  const set = useCallback((next: T | ((prev: T) => T), options?: { skipHistory?: boolean }) => {
    setState((current) => {
      const resolved = typeof next === "function" ? (next as (prev: T) => T)(current.present) : next;

      if (options?.skipHistory || skipNextPush.current) {
        skipNextPush.current = false;
        return { ...current, present: resolved };
      }

      if (resolved === current.present) return current;

      return {
        past: [...current.past, current.present].slice(-MAX_HISTORY),
        present: resolved,
        future: [],
      };
    });
  }, []);

  const undo = useCallback(() => {
    setState((current) => {
      if (current.past.length === 0) return current;
      const previous = current.past[current.past.length - 1];
      return {
        past: current.past.slice(0, -1),
        present: previous,
        future: [current.present, ...current.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState((current) => {
      if (current.future.length === 0) return current;
      const next = current.future[0];
      return {
        past: [...current.past, current.present],
        present: next,
        future: current.future.slice(1),
      };
    });
  }, []);

  const reset = useCallback((next: T) => {
    setState({ past: [], present: next, future: [] });
  }, []);

  const replaceWithoutHistory = useCallback((next: T) => {
    skipNextPush.current = true;
    set(next, { skipHistory: true });
  }, [set]);

  return {
    present: state.present,
    set,
    undo,
    redo,
    reset,
    replaceWithoutHistory,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  };
}
