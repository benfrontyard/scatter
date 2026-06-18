import type { TimelineMarker, WordTimestamp } from "@/types";

export type PhraseChunkingOptions = {
  /** Max phrase duration in seconds */
  maxPhraseDuration?: number;
  /** Min phrase duration — shorter phrases merge with next */
  minPhraseDuration?: number;
  /** Min gap between words to start a new phrase (seconds) */
  pauseGapThreshold?: number;
};

const DEFAULT_OPTIONS: Required<PhraseChunkingOptions> = {
  maxPhraseDuration: 6,
  minPhraseDuration: 1.2,
  pauseGapThreshold: 0.35,
};

const PHRASE_END_PUNCTUATION = /[.!?;:…]$/;

function computeEmphasis(word: WordTimestamp): number {
  const duration = word.endTime - word.startTime;
  const lengthBoost = Math.min(word.word.length / 12, 0.3);
  const durationBoost = Math.min(duration / 0.5, 0.3);
  const capsBoost = word.word === word.word.toUpperCase() && word.word.length > 2 ? 0.2 : 0;
  return Math.min(1, 0.3 + lengthBoost + durationBoost + capsBoost + (word.emphasis ?? 0));
}

export function groupWordsIntoPhrases(
  words: WordTimestamp[],
  options: PhraseChunkingOptions = {},
): TimelineMarker[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  if (words.length === 0) return [];

  const phrases: TimelineMarker[] = [];
  let chunkWords: WordTimestamp[] = [words[0]!];
  let chunkStart = words[0]!.startTime;

  const flushChunk = () => {
    if (chunkWords.length === 0) return;
    const text = chunkWords.map((w) => w.word).join(" ");
    const endTime = chunkWords[chunkWords.length - 1]!.endTime;
    const emphasis =
      chunkWords.reduce((sum, w) => sum + computeEmphasis(w), 0) / chunkWords.length;

    phrases.push({
      id: `phrase-${phrases.length}`,
      type: "phrase",
      time: chunkStart,
      endTime,
      label: text,
      source: "voiceover",
      emphasis,
      confidence: 0.85,
    });

    chunkWords = [];
  };

  for (let i = 1; i < words.length; i++) {
    const prev = words[i - 1]!;
    const current = words[i]!;
    const gap = current.startTime - prev.endTime;
    const chunkDuration = prev.endTime - chunkStart;
    const endsWithPunctuation = PHRASE_END_PUNCTUATION.test(prev.word);

    const shouldBreak =
      gap >= opts.pauseGapThreshold ||
      endsWithPunctuation ||
      chunkDuration >= opts.maxPhraseDuration;

    chunkWords.push(current);

    if (shouldBreak) {
      flushChunk();
      chunkStart = current.startTime;
      chunkWords = [current];
    }
  }

  flushChunk();

  return mergeShortPhrases(phrases, opts.minPhraseDuration);
}

export function mergeShortPhrases(
  phrases: TimelineMarker[],
  minDuration: number,
): TimelineMarker[] {
  if (phrases.length <= 1) return phrases;

  const merged: TimelineMarker[] = [];
  let pending: TimelineMarker | null = null;

  for (const phrase of phrases) {
    const duration = (phrase.endTime ?? phrase.time) - phrase.time;

    if (pending) {
      const pendingDuration = (pending.endTime ?? pending.time) - pending.time;
      if (pendingDuration < minDuration) {
        const combined: TimelineMarker = {
          ...pending,
          endTime: phrase.endTime ?? phrase.time,
          label: [pending.label, phrase.label].filter(Boolean).join(" "),
          emphasis: Math.max(pending.emphasis ?? 0, phrase.emphasis ?? 0),
        };
        pending = combined;
        if (((pending.endTime ?? pending.time) - pending.time) >= minDuration) {
          merged.push(pending);
          pending = null;
        }
        continue;
      }
      merged.push(pending);
      pending = null;
    }

    if (duration < minDuration) {
      pending = phrase;
    } else {
      merged.push(phrase);
    }
  }

  if (pending) {
    const last = merged[merged.length - 1];
    if (last) {
      merged[merged.length - 1] = {
        ...last,
        endTime: pending.endTime ?? pending.time,
        label: [last.label, pending.label].filter(Boolean).join(" "),
        emphasis: Math.max(last.emphasis ?? 0, pending.emphasis ?? 0),
      };
    } else {
      merged.push(pending);
    }
  }

  return merged.map((phrase, index) => ({
    ...phrase,
    id: `phrase-${index}`,
  }));
}

export function transcriptToEstimatedWords(
  transcript: string,
  duration: number,
): WordTimestamp[] {
  const tokens = transcript
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (tokens.length === 0) return [];

  const timePerWord = duration / tokens.length;
  return tokens.map((word, index) => ({
    word,
    startTime: index * timePerWord,
    endTime: (index + 1) * timePerWord,
  }));
}

export function wordsToMarkers(words: WordTimestamp[]): TimelineMarker[] {
  return words.map((word, index) => ({
    id: `word-${index}`,
    type: "word" as const,
    time: word.startTime,
    endTime: word.endTime,
    label: word.word,
    source: "voiceover" as const,
    emphasis: computeEmphasis(word),
    confidence: 0.8,
  }));
}
