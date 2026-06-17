import type { SelectorDirection } from "@/types/text-animation";
import type { ResolvedUnitTiming } from "@/types/text-animation";

function seededRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function shuffleIndices(count: number, seed: number): number[] {
  const indices = Array.from({ length: count }, (_, index) => index);
  const random = seededRandom(seed);

  for (let i = indices.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  return indices;
}

function centerOutOrder(count: number): number[] {
  const order: number[] = [];
  let left = Math.floor((count - 1) / 2);
  let right = left + (count % 2 === 0 ? 1 : 0);

  while (order.length < count) {
    if (left >= 0) {
      order.push(left);
      left -= 1;
    }
    if (right < count && right !== left + 1) {
      order.push(right);
      right += 1;
    }
  }

  return order;
}

function edgesInOrder(count: number): number[] {
  const order: number[] = [];
  let left = 0;
  let right = count - 1;

  while (left <= right) {
    order.push(left);
    if (left !== right) order.push(right);
    left += 1;
    right -= 1;
  }

  return order;
}

export function getSelectorOrder(
  count: number,
  direction: SelectorDirection,
  randomSeed = 42,
): number[] {
  if (count <= 0) return [];

  switch (direction) {
    case "rtl":
      return Array.from({ length: count }, (_, index) => count - 1 - index);
    case "centerOut":
      return centerOutOrder(count);
    case "edgesIn":
      return edgesInOrder(count);
    case "random":
      return shuffleIndices(count, randomSeed);
    case "ltr":
    default:
      return Array.from({ length: count }, (_, index) => index);
  }
}

export function computeUnitTimings(
  unitCount: number,
  direction: SelectorDirection,
  stagger: number,
  duration: number,
  delay: number,
  randomSeed?: number,
): ResolvedUnitTiming[] {
  if (unitCount <= 0) return [];

  const order = getSelectorOrder(unitCount, direction, randomSeed ?? 42);
  const positionByIndex = new Map(order.map((unitIndex, position) => [unitIndex, position]));

  return Array.from({ length: unitCount }, (_, index) => ({
    index,
    startFrame: delay + (positionByIndex.get(index) ?? index) * stagger,
    duration,
  }));
}

export function getUnitProgress(
  frame: number,
  timing: ResolvedUnitTiming,
  easingFn?: (t: number) => number,
): number {
  const localFrame = frame - timing.startFrame;
  if (localFrame <= 0) return 0;
  if (localFrame >= timing.duration) return 1;

  const linear = localFrame / timing.duration;
  return easingFn ? easingFn(linear) : linear;
}
