import { sampleEasingPreset } from "@/lib/easing";
import { cn } from "@/lib/utils";
import type { EasingPreset } from "@/types";
import { useEffect, useId, useState } from "react";

type EasingCurvePreviewProps = {
  preset: EasingPreset;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  className?: string;
  showEndpoints?: boolean;
};

const SIZE_MAP = {
  sm: { width: 48, height: 32, stroke: 1.5, dot: 3 },
  md: { width: 120, height: 72, stroke: 2, dot: 4 },
  lg: { width: 200, height: 120, stroke: 2.5, dot: 5 },
};

function toSvgPath(points: Array<{ x: number; y: number }>, width: number, height: number): string {
  const pad = 4;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;

  return points
    .map((point, index) => {
      const x = pad + point.x * innerW;
      const y = pad + (1 - point.y) * innerH;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

export function EasingCurvePreview({
  preset,
  size = "sm",
  animated = false,
  className,
  showEndpoints = true,
}: EasingCurvePreviewProps) {
  const { width, height, stroke, dot } = SIZE_MAP[size];
  const points = sampleEasingPreset(preset);
  const path = toSvgPath(points, width, height);
  const titleId = useId();
  const [animProgress, setAnimProgress] = useState(0);

  useEffect(() => {
    if (!animated) return;

    let frame: number;
    let start: number | null = null;
    const duration = 1600;

    const tick = (timestamp: number) => {
      if (start === null) start = timestamp;
      const elapsed = (timestamp - start) % duration;
      setAnimProgress(elapsed / duration);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [animated]);

  const pad = 4;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;

  const dotIndex = Math.min(
    Math.round(animProgress * (points.length - 1)),
    points.length - 1,
  );
  const dotPoint = points[dotIndex];
  const dotX = pad + dotPoint.x * innerW;
  const dotY = pad + (1 - dotPoint.y) * innerH;

  const timingFunction =
    preset.cssValue === "linear" ? "linear" : preset.cssValue.replace("cubic-bezier", "cubic-bezier");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("shrink-0 text-foreground", className)}
      role="img"
      aria-labelledby={titleId}
    >
      <title id={titleId}>
        {preset.name} easing curve: {preset.cssValue}
      </title>

      <rect
        x={pad}
        y={pad}
        width={innerW}
        height={innerH}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.12}
        strokeWidth={1}
        rx={2}
      />

      {showEndpoints ? (
        <>
          <circle
            cx={pad}
            cy={pad + innerH}
            r={dot - 0.5}
            fill="currentColor"
            fillOpacity={0.35}
          />
          <circle cx={pad + innerW} cy={pad} r={dot - 0.5} fill="currentColor" fillOpacity={0.35} />
        </>
      ) : null}

      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {animated ? (
        <circle
          cx={dotX}
          cy={dotY}
          r={dot}
          fill="currentColor"
          style={{
            transition: animated ? undefined : `transform 0.1s ${timingFunction}` as const,
          }}
        />
      ) : null}
    </svg>
  );
}
