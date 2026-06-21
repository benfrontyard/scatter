export type DurationPreset = {
  id: string;
  label: string;
  seconds: number;
  /** Short hint for where this length works best */
  platforms: string;
};

/** Common social / ad video lengths — scales the full sequence proportionally. */
export const PLATFORM_DURATION_PRESETS: DurationPreset[] = [
  { id: "15s", label: "15s", seconds: 15, platforms: "Reels, TikTok, Stories" },
  { id: "30s", label: "30s", seconds: 30, platforms: "Short ads, feed video" },
  { id: "45s", label: "45s", seconds: 45, platforms: "Extended social" },
  { id: "60s", label: "1m", seconds: 60, platforms: "YouTube Shorts, TikTok" },
  { id: "90s", label: "1:30", seconds: 90, platforms: "LinkedIn, long Shorts" },
  { id: "120s", label: "2m", seconds: 120, platforms: "LinkedIn max" },
];
