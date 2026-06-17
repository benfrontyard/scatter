export type ParsedStatValue = {
  numericPart: number;
  prefix: string;
  suffix: string;
  decimals: number;
  isNumeric: boolean;
};

export function parseStatValue(raw: string): ParsedStatValue {
  const trimmed = raw.trim();
  const match = trimmed.match(/^([^0-9.-]*)(-?\d+(?:\.\d+)?)(.*)$/);

  if (!match) {
    return {
      numericPart: 0,
      prefix: "",
      suffix: "",
      decimals: 0,
      isNumeric: false,
    };
  }

  const [, prefix, numberPart, suffix] = match;
  const decimals = numberPart.includes(".") ? numberPart.split(".")[1].length : 0;

  return {
    numericPart: Number.parseFloat(numberPart),
    prefix: prefix ?? "",
    suffix: suffix ?? "",
    decimals,
    isNumeric: true,
  };
}

export function formatStatValue(parsed: ParsedStatValue, current: number): string {
  if (!parsed.isNumeric) return "";

  const formatted =
    parsed.decimals > 0 ? current.toFixed(parsed.decimals) : String(Math.round(current));

  return `${parsed.prefix}${formatted}${parsed.suffix}`;
}
