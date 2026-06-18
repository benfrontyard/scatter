import type { WordTimestamp } from "@/types";

/** ElevenLabs alignment / timestamp JSON shapes */
type ElevenLabsCharacter = {
  character: string;
  start: number;
  end: number;
};

type ElevenLabsWord = {
  word: string;
  start: number;
  end: number;
};

export function parseElevenLabsWordTimestamps(
  data: unknown,
): WordTimestamp[] | null {
  if (!data || typeof data !== "object") return null;

  const record = data as Record<string, unknown>;

  if (Array.isArray(record.words)) {
    return (record.words as ElevenLabsWord[]).map((w) => ({
      word: w.word,
      startTime: w.start,
      endTime: w.end,
    }));
  }

  if (Array.isArray(record.alignment)) {
    return buildWordsFromCharacters(record.alignment as ElevenLabsCharacter[]);
  }

  if (Array.isArray(record.characters)) {
    return buildWordsFromCharacters(record.characters as ElevenLabsCharacter[]);
  }

  return null;
}

function buildWordsFromCharacters(chars: ElevenLabsCharacter[]): WordTimestamp[] {
  const words: WordTimestamp[] = [];
  let current = "";
  let startTime = 0;
  let endTime = 0;

  for (const char of chars) {
    if (char.character === " " || char.character === "\n") {
      if (current.trim()) {
        words.push({ word: current.trim(), startTime, endTime });
      }
      current = "";
      continue;
    }

    if (!current) startTime = char.start;
    current += char.character;
    endTime = char.end;
  }

  if (current.trim()) {
    words.push({ word: current.trim(), startTime, endTime });
  }

  return words;
}

export function parseWordTimestampsJson(json: string): WordTimestamp[] | null {
  try {
    const parsed = JSON.parse(json) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.map((item) => {
        const w = item as Record<string, number | string>;
        return {
          word: String(w.word ?? w.text ?? ""),
          startTime: Number(w.startTime ?? w.start ?? 0),
          endTime: Number(w.endTime ?? w.end ?? 0),
        };
      });
    }
    return parseElevenLabsWordTimestamps(parsed);
  } catch {
    return null;
  }
}
