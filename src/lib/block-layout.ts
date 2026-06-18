import type { BlockFormatLayoutOverrides } from "@/types/block-layout";

export function normalizeBlockLayoutOverrides(
  overrides: unknown,
): BlockFormatLayoutOverrides | undefined {
  if (!overrides || typeof overrides !== "object") return undefined;

  const value = overrides as Partial<BlockFormatLayoutOverrides>;
  if (!value.formats || typeof value.formats !== "object") return undefined;

  return { formats: { ...value.formats } };
}
