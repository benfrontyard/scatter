import { cn } from "@/lib/utils";
import { useId } from "react";

type ScatterDot = {
  cx: number;
  cy: number;
  r: number;
};

const SCATTER_DOTS: ScatterDot[] = (() => {
  const center = 89;
  const rings = [
    { radius: 24, size: 5.5 },
    { radius: 46, size: 9.5 },
    { radius: 68, size: 14.5 },
  ];

  const dots: ScatterDot[] = [];
  for (let axis = 0; axis < 6; axis += 1) {
    const angle = (-90 + axis * 60) * (Math.PI / 180);
    for (const ring of rings) {
      dots.push({
        cx: center + ring.radius * Math.cos(angle),
        cy: center + ring.radius * Math.sin(angle),
        r: ring.size,
      });
    }
  }
  return dots;
})();

type ScatterIconMarkProps = {
  className?: string;
  size?: number;
};

export function ScatterIconMark({ className, size = 32 }: ScatterIconMarkProps) {
  const gradientId = useId().replace(/:/g, "");

  return (
    <svg
      viewBox="0 0 178 178"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--scatter-icon-highlight)" />
          <stop offset="100%" stopColor="var(--scatter-icon-shadow)" />
        </linearGradient>
      </defs>
      {SCATTER_DOTS.map((dot, index) => (
        <circle key={index} cx={dot.cx} cy={dot.cy} r={dot.r} fill={`url(#${gradientId})`} />
      ))}
    </svg>
  );
}
