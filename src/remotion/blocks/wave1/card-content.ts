import type { BlockContent } from "@/types";

export type CollageCardData = {
  index: number;
  title: string;
  body?: string;
};

export type CarouselItemData = {
  index: number;
  title: string;
  meta?: string;
};

export function parseCollageCards(content: BlockContent, maxCards: number): CollageCardData[] {
  const cards: CollageCardData[] = [];

  for (let i = 1; i <= maxCards; i += 1) {
    const title = content[`card-${i}-title`]?.trim();
    if (!title) continue;
    cards.push({
      index: i,
      title,
      body: content[`card-${i}-body`]?.trim() || undefined,
    });
  }

  return cards;
}

export function parseCarouselItems(content: BlockContent, maxItems: number): CarouselItemData[] {
  const items: CarouselItemData[] = [];

  for (let i = 1; i <= maxItems; i += 1) {
    const title = content[`item-${i}-title`]?.trim();
    if (!title) continue;
    items.push({
      index: i,
      title,
      meta: content[`item-${i}-meta`]?.trim() || undefined,
    });
  }

  return items;
}

export function resolveHeroCardIndex(content: BlockContent, controls: Record<string, number | string>): number {
  const raw = controls.heroCardIndex ?? content.heroCardIndex ?? "1";
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : 1;
}

export function resolveActiveCarouselIndex(
  content: BlockContent,
  controls: Record<string, number | string>,
  itemCount: number,
): number {
  const raw = controls.activeIndex ?? content.activeIndex ?? "1";
  const oneBased = Number(raw);
  const index = Number.isFinite(oneBased) ? Math.round(oneBased) - 1 : 0;
  return Math.min(Math.max(index, 0), Math.max(itemCount - 1, 0));
}

export function maxCollageCardsForFormat(aspectRatio: string): number {
  if (aspectRatio === "9:16") return 3;
  if (aspectRatio === "1:1" || aspectRatio === "4:5") return 4;
  return 6;
}

export function maxCarouselItemsForFormat(aspectRatio: string): number {
  if (aspectRatio === "9:16" || aspectRatio === "1:1") return 3;
  return 5;
}

export function showCarouselFlanks(aspectRatio: string): boolean {
  return aspectRatio === "16:9" || aspectRatio === "4:5";
}

/** Normalized collage positions per card slot (hero defaults to index 1). */
export const COLLAGE_LAYOUT_16_9: Record<number, { x: number; y: number; w: number; h: number; z: number }> = {
  1: { x: 0.32, y: 0.18, w: 0.36, h: 0.58, z: 3 },
  2: { x: 0.62, y: 0.1, w: 0.28, h: 0.38, z: 2 },
  3: { x: 0.08, y: 0.46, w: 0.26, h: 0.36, z: 1 },
  4: { x: 0.68, y: 0.52, w: 0.24, h: 0.32, z: 1 },
  5: { x: 0.14, y: 0.12, w: 0.22, h: 0.28, z: 0 },
  6: { x: 0.48, y: 0.62, w: 0.2, h: 0.26, z: 0 },
};

export const COLLAGE_LAYOUT_PORTRAIT: Record<number, { x: number; y: number; w: number; h: number; z: number }> = {
  1: { x: 0.1, y: 0.28, w: 0.8, h: 0.38, z: 3 },
  2: { x: 0.06, y: 0.12, w: 0.42, h: 0.22, z: 1 },
  3: { x: 0.52, y: 0.68, w: 0.42, h: 0.22, z: 1 },
};
