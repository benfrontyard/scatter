import type { TextAnimationTarget } from "@/types/text-animation";

export type TextUnit = {
  text: string;
  index: number;
  lineIndex: number;
  wordIndex: number;
  charIndex: number;
  isWhitespace: boolean;
  animate: boolean;
};

export type SplitTextOptions = {
  /** When splitting by line, split on explicit newlines as well */
  respectNewlines?: boolean;
};

function splitCharacters(text: string, lineIndex: number, wordIndex: number): TextUnit[] {
  const units: TextUnit[] = [];
  let charIndex = 0;

  const segmenter =
    typeof Intl !== "undefined" && "Segmenter" in Intl
      ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
      : null;

  if (segmenter) {
    let index = 0;
    for (const segment of segmenter.segment(text)) {
      const grapheme = segment.segment;
      const isWhitespace = /^\s+$/.test(grapheme);
      units.push({
        text: grapheme,
        index,
        lineIndex,
        wordIndex,
        charIndex,
        isWhitespace,
        animate: !isWhitespace,
      });
      if (!isWhitespace) charIndex += 1;
      index += 1;
    }
    return units;
  }

  for (const char of text) {
    const isWhitespace = /\s/.test(char);
    units.push({
      text: char,
      index: units.length,
      lineIndex,
      wordIndex,
      charIndex,
      isWhitespace,
      animate: !isWhitespace,
    });
    if (!isWhitespace) charIndex += 1;
  }

  return units;
}

function splitWordsInLine(line: string, lineIndex: number): TextUnit[] {
  const units: TextUnit[] = [];
  const parts = line.split(/(\s+)/);
  let wordIndex = 0;

  for (const part of parts) {
    if (!part) continue;

    if (/^\s+$/.test(part)) {
      const prev = units[units.length - 1];
      if (prev && !prev.isWhitespace) {
        prev.text += part;
      }
      continue;
    }

    units.push({
      text: part,
      index: units.length,
      lineIndex,
      wordIndex,
      charIndex: 0,
      isWhitespace: false,
      animate: true,
    });
    wordIndex += 1;
  }

  return units;
}

function splitLines(text: string, respectNewlines: boolean): string[] {
  if (respectNewlines && text.includes("\n")) {
    return text.split("\n");
  }
  return [text];
}

export function splitText(
  text: string,
  unit: TextAnimationTarget,
  options: SplitTextOptions = {},
): TextUnit[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  if (unit === "block") {
    return [
      {
        text: trimmed,
        index: 0,
        lineIndex: 0,
        wordIndex: 0,
        charIndex: 0,
        isWhitespace: false,
        animate: true,
      },
    ];
  }

  const lines = splitLines(trimmed, options.respectNewlines ?? true);
  const allUnits: TextUnit[] = [];

  if (unit === "line") {
    lines.forEach((line, lineIndex) => {
      const lineText = line.trim();
      if (!lineText) return;
      allUnits.push({
        text: lineText,
        index: allUnits.length,
        lineIndex,
        wordIndex: 0,
        charIndex: 0,
        isWhitespace: false,
        animate: true,
      });
    });
    return allUnits;
  }

  if (unit === "word") {
    lines.forEach((line, lineIndex) => {
      const lineUnits = splitWordsInLine(line, lineIndex);
      for (const lineUnit of lineUnits) {
        allUnits.push({ ...lineUnit, index: allUnits.length });
      }
    });
    return allUnits;
  }

  // character
  lines.forEach((line, lineIndex) => {
    const wordParts = line.split(/(\s+)/);
    let wordIndex = 0;

    for (const part of wordParts) {
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        const prev = allUnits[allUnits.length - 1];
        if (prev) {
          prev.text += part;
        }
        continue;
      }

      const charUnits = splitCharacters(part, lineIndex, wordIndex);
      for (const charUnit of charUnits) {
        allUnits.push({ ...charUnit, index: allUnits.length });
      }
      wordIndex += 1;
    }
  });

  return allUnits;
}

export function getAnimatableUnits(units: TextUnit[]): TextUnit[] {
  return units.filter((unit) => unit.animate);
}

export function filterUnitsByWordIndices(
  units: TextUnit[],
  wordIndices: number[] | undefined,
): TextUnit[] {
  if (!wordIndices || wordIndices.length === 0) return units;

  const allowed = new Set(wordIndices);
  return units.map((unit) => ({
    ...unit,
    animate: unit.animate && allowed.has(unit.wordIndex),
  }));
}
