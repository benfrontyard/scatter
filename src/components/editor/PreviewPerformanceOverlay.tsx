import { PerformanceMonitor } from "@/lib/playback";
import { useEffect, useRef, useState } from "react";

type PreviewPerformanceOverlayProps = {
  isPlaying: boolean;
  targetFps: number;
};

export function PreviewPerformanceOverlay({
  isPlaying,
  targetFps,
}: PreviewPerformanceOverlayProps) {
  const monitorRef = useRef<PerformanceMonitor | null>(null);
  const [stats, setStats] = useState({ fps: 0, droppedFrames: 0, memoryMb: undefined as number | undefined });

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    const monitor = new PerformanceMonitor(targetFps);
    monitorRef.current = monitor;

    const unsubscribe = monitor.onUpdate((next) => {
      setStats({
        fps: next.fps,
        droppedFrames: next.droppedFrames,
        memoryMb: next.memoryMb,
      });
    });

    return () => {
      unsubscribe();
      monitor.stop();
      monitorRef.current = null;
    };
  }, [targetFps]);

  useEffect(() => {
    const monitor = monitorRef.current;
    if (!monitor) return;

    if (isPlaying) {
      monitor.reset();
      monitor.start();
    } else {
      monitor.stop();
    }
  }, [isPlaying]);

  if (!import.meta.env.DEV) return null;

  const fpsColor =
    stats.fps >= targetFps * 0.85
      ? "text-emerald-400"
      : stats.fps >= targetFps * 0.6
        ? "text-amber-400"
        : "text-red-400";

  return (
    <div className="pointer-events-none absolute left-2 top-2 z-20 rounded bg-black/70 px-2 py-1 font-mono text-[10px] tabular-nums text-white/80 backdrop-blur-sm">
      <span className={fpsColor}>{stats.fps.toFixed(1)}</span>
      <span className="text-white/50"> fps</span>
      {stats.droppedFrames > 0 ? (
        <span className="ml-2 text-red-400">↓{stats.droppedFrames}</span>
      ) : null}
      {stats.memoryMb !== undefined ? (
        <span className="ml-2 text-white/50">{stats.memoryMb}MB</span>
      ) : null}
    </div>
  );
}
