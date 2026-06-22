import { useEffect, useState } from "react";

export function useCountUp(target: number, durationMs: number, reducedMotion: boolean): number {
  const [value, setValue] = useState(reducedMotion ? target : 0);

  useEffect(() => {
    if (reducedMotion) {
      setValue(target);
      return;
    }

    let raf = 0;
    let interval: ReturnType<typeof setInterval> | undefined;

    const run = () => {
      const start = performance.now();
      setValue(0);

      const tick = (now: number) => {
        const progress = Math.min((now - start) / durationMs, 1);
        const eased = 1 - (1 - progress) ** 3;
        setValue(Math.round(target * eased));
        if (progress < 1) {
          raf = requestAnimationFrame(tick);
        }
      };

      raf = requestAnimationFrame(tick);
    };

    run();
    interval = setInterval(run, durationMs + 1600);

    return () => {
      cancelAnimationFrame(raf);
      if (interval) clearInterval(interval);
    };
  }, [target, durationMs, reducedMotion]);

  return value;
}
