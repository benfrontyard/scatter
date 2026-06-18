export type PerformanceStats = {
  fps: number;
  droppedFrames: number;
  frameTimeMs: number;
  memoryMb?: number;
};

type PerformanceListener = (stats: PerformanceStats) => void;

export class PerformanceMonitor {
  private rafId: number | null = null;
  private lastFrameTime = 0;
  private frameCount = 0;
  private fpsWindow: number[] = [];
  private droppedFrames = 0;
  private listeners = new Set<PerformanceListener>();
  private targetFps: number;
  private running = false;

  constructor(targetFps = 30) {
    this.targetFps = targetFps;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastFrameTime = performance.now();
    this.tick();
  }

  stop(): void {
    this.running = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  onUpdate(listener: PerformanceListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getStats(): PerformanceStats {
    const avgFps =
      this.fpsWindow.length > 0
        ? this.fpsWindow.reduce((a, b) => a + b, 0) / this.fpsWindow.length
        : this.targetFps;

    return {
      fps: Math.round(avgFps * 10) / 10,
      droppedFrames: this.droppedFrames,
      frameTimeMs:
        this.fpsWindow.length > 0
          ? Math.round((1000 / avgFps) * 10) / 10
          : 0,
      memoryMb: this.getMemoryUsageMb(),
    };
  }

  reset(): void {
    this.droppedFrames = 0;
    this.fpsWindow = [];
    this.frameCount = 0;
  }

  private tick = (): void => {
    if (!this.running) return;

    const now = performance.now();
    const delta = now - this.lastFrameTime;
    this.lastFrameTime = now;
    this.frameCount++;

    if (delta > 0) {
      const instantFps = 1000 / delta;
      this.fpsWindow.push(instantFps);
      if (this.fpsWindow.length > 30) {
        this.fpsWindow.shift();
      }

      const expectedFrameTime = 1000 / this.targetFps;
      if (delta > expectedFrameTime * 1.5) {
        const skipped = Math.floor(delta / expectedFrameTime) - 1;
        if (skipped > 0) {
          this.droppedFrames += skipped;
          if (import.meta.env.DEV) {
            console.debug(
              `[perf] dropped ${skipped} frame(s), delta=${delta.toFixed(1)}ms`,
            );
          }
        }
      }
    }

    if (this.frameCount % 10 === 0) {
      const stats = this.getStats();
      for (const listener of this.listeners) {
        listener(stats);
      }
    }

    this.rafId = requestAnimationFrame(this.tick);
  };

  private getMemoryUsageMb(): number | undefined {
    const perf = performance as Performance & {
      memory?: { usedJSHeapSize: number };
    };
    if (perf.memory) {
      return Math.round(perf.memory.usedJSHeapSize / (1024 * 1024));
    }
    return undefined;
  }
}
