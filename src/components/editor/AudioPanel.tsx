import { useEditor } from "@/context/editor-context";
import { parseWordTimestampsJson } from "@/lib/audio/parse-timestamps";
import { cn } from "@/lib/utils";
import type { MagicEditSettings, PauseCleanup, RhythmDensity, SyncPriority } from "@/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Mic, Music, Sparkles, Upload, Wand2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";

type AudioPanelProps = {
  className?: string;
};

function SettingSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Select value={value} onValueChange={(v) => onChange(v as T)}>
        <SelectTrigger className="h-8 w-full text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function AudioPanel({ className }: AudioPanelProps) {
  const {
    assets,
    sequence,
    addAudioAsset,
    removeAsset,
    setVoiceover,
    setMusicTrack,
    setVoiceoverTranscript,
    setVoiceoverWordTimestamps,
    runMagicEdit,
    magicEditSettings,
    setMagicEditSettings,
    isMagicEditRunning,
    loadAnixaDemo,
  } = useEditor();

  const voInputRef = useRef<HTMLInputElement>(null);
  const musicInputRef = useRef<HTMLInputElement>(null);
  const [timestampJson, setTimestampJson] = useState("");

  const voiceover = sequence.audio?.voiceover;
  const music = sequence.audio?.music;
  const voAsset = voiceover ? assets.find((a) => a.id === voiceover.assetId) : undefined;
  const musicAsset = music ? assets.find((a) => a.id === music.assetId) : undefined;
  const markers = sequence.audio?.markers ?? [];
  const phraseCount = markers.filter((m) => m.type === "phrase").length;

  const handleVoUpload = useCallback(
    async (file: File) => {
      const asset = await addAudioAsset(file);
      if (!asset) return;
      setVoiceover({
        assetId: asset.id,
        provider: "upload",
        transcript: voiceover?.transcript,
      });
    },
    [addAudioAsset, setVoiceover, voiceover?.transcript],
  );

  const handleMusicUpload = useCallback(
    async (file: File) => {
      const asset = await addAudioAsset(file);
      if (!asset) return;
      setMusicTrack({ assetId: asset.id, fitMode: magicEditSettings.musicFit });
    },
    [addAudioAsset, setMusicTrack, magicEditSettings.musicFit],
  );

  const applyTimestamps = useCallback(() => {
    if (!timestampJson.trim()) return;
    const parsed = parseWordTimestampsJson(timestampJson);
    if (parsed?.length) {
      setVoiceoverWordTimestamps(parsed);
    }
  }, [setVoiceoverWordTimestamps, timestampJson]);

  const updateSettings = useCallback(
    (partial: Partial<MagicEditSettings>) => setMagicEditSettings(partial),
    [setMagicEditSettings],
  );

  return (
    <div className={cn("flex h-full flex-col overflow-hidden", className)}>
      <div className="shrink-0 border-b border-border px-3 py-3">
        <div className="flex items-center gap-2">
          <Mic className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Audio & Magic Edit</h2>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          Import voiceover and music, then auto-time blocks to narration phrases.
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-3">
        <section className="space-y-2 rounded-md border border-dashed border-violet-500/30 bg-violet-500/5 p-2.5">
          <Label className="text-xs font-medium">Demo</Label>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Load the Anixa Biosciences test with your VO, music, and script pre-mapped to blocks.
          </p>
          <Button
            type="button"
            variant="secondary"
            className="h-8 w-full text-xs"
            disabled={isMagicEditRunning}
            onClick={() => void loadAnixaDemo(true)}
          >
            {isMagicEditRunning ? (
              <>
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                Loading demo…
              </>
            ) : (
              "Load Anixa demo + Magic Edit"
            )}
          </Button>
        </section>

        <section className="space-y-2 rounded-md border border-border bg-background/50 p-2.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">Voiceover</Label>
            <input
              ref={voInputRef}
              type="file"
              accept="audio/*"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleVoUpload(file);
                e.target.value = "";
              }}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => voInputRef.current?.click()}
            >
              <Upload className="mr-1 h-3 w-3" />
              Upload
            </Button>
          </div>
          {voAsset ? (
            <div className="flex items-center gap-2 rounded-sm border border-border px-2 py-1.5 text-xs">
              <Mic className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate">{voAsset.name}</span>
              {voAsset.duration ? (
                <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                  {voAsset.duration.toFixed(1)}s
                </span>
              ) : null}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 shrink-0 px-1.5 text-[10px] text-muted-foreground hover:text-destructive"
                onClick={() => {
                  removeAsset(voAsset.id);
                }}
              >
                Remove
              </Button>
            </div>
          ) : (
            <p className="py-2 text-center text-[11px] text-muted-foreground">
              Upload VO from ElevenLabs or any source
            </p>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="vo-transcript" className="text-xs text-muted-foreground">
              Script / transcript
            </Label>
            <Textarea
              id="vo-transcript"
              value={voiceover?.transcript ?? ""}
              onChange={(e) => setVoiceoverTranscript(e.target.value)}
              placeholder="Paste narration script for phrase timing…"
              className="min-h-[72px] resize-y text-xs"
              disabled={!voiceover}
            />
          </div>

          <details className="text-xs">
            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
              Word timestamps (ElevenLabs JSON)
            </summary>
            <div className="mt-2 space-y-1.5">
              <Textarea
                value={timestampJson}
                onChange={(e) => setTimestampJson(e.target.value)}
                placeholder='{"words": [{"word": "Hello", "start": 0, "end": 0.3}]}'
                className="min-h-[56px] font-mono text-[10px]"
                disabled={!voiceover}
              />
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="h-7 text-xs"
                disabled={!voiceover || !timestampJson.trim()}
                onClick={applyTimestamps}
              >
                Apply timestamps
              </Button>
            </div>
          </details>
        </section>

        <section className="space-y-2 rounded-md border border-border bg-background/50 p-2.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">Background music</Label>
            <input
              ref={musicInputRef}
              type="file"
              accept="audio/*"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleMusicUpload(file);
                e.target.value = "";
              }}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => musicInputRef.current?.click()}
            >
              <Upload className="mr-1 h-3 w-3" />
              Upload
            </Button>
          </div>
          {musicAsset ? (
            <div className="flex items-center gap-2 rounded-sm border border-border px-2 py-1.5 text-xs">
              <Music className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate">{musicAsset.name}</span>
              {musicAsset.duration ? (
                <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                  {musicAsset.duration.toFixed(1)}s
                </span>
              ) : null}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 shrink-0 px-1.5 text-[10px] text-muted-foreground hover:text-destructive"
                onClick={() => removeAsset(musicAsset.id)}
              >
                Remove
              </Button>
            </div>
          ) : (
            <p className="py-2 text-center text-[11px] text-muted-foreground">
              Optional — music ducks under voiceover automatically
            </p>
          )}
        </section>

        <section className="space-y-3 rounded-md border border-violet-500/25 bg-violet-500/5 p-2.5">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-violet-500" />
            <Label className="text-xs font-medium">Magic Edit settings</Label>
          </div>

          <SettingSelect<RhythmDensity>
            label="Rhythm"
            value={magicEditSettings.rhythm}
            options={[
              { value: "calm", label: "Calm — phrases & major beats" },
              { value: "balanced", label: "Balanced" },
              { value: "high-energy", label: "High energy — more beat sync" },
            ]}
            onChange={(rhythm) => updateSettings({ rhythm })}
          />

          <SettingSelect<SyncPriority>
            label="Sync priority"
            value={magicEditSettings.syncPriority}
            options={[
              { value: "voice-first", label: "Voice-first" },
              { value: "balanced", label: "Balanced" },
              { value: "beat-first", label: "Beat-first" },
            ]}
            onChange={(syncPriority) => updateSettings({ syncPriority })}
          />

          <SettingSelect<PauseCleanup>
            label="Pause cleanup"
            value={magicEditSettings.pauseCleanup}
            options={[
              { value: "off", label: "Off" },
              { value: "light", label: "Light" },
              { value: "standard", label: "Standard" },
              { value: "tight", label: "Tight" },
            ]}
            onChange={(pauseCleanup) => updateSettings({ pauseCleanup })}
          />

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant={magicEditSettings.ducking ? "default" : "outline"}
              className="h-7 text-xs"
              onClick={() => updateSettings({ ducking: !magicEditSettings.ducking })}
            >
              Ducking {magicEditSettings.ducking ? "on" : "off"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={magicEditSettings.preserveManualEdits ? "default" : "outline"}
              className="h-7 text-xs"
              onClick={() =>
                updateSettings({
                  preserveManualEdits: !magicEditSettings.preserveManualEdits,
                })
              }
            >
              Preserve edits
            </Button>
          </div>

          <Button
            type="button"
            className="h-9 w-full text-sm"
            disabled={!voiceover || isMagicEditRunning || sequence.blocks.length === 0}
            onClick={() => void runMagicEdit()}
          >
            {isMagicEditRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing…
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Run Magic Edit
              </>
            )}
          </Button>

          {phraseCount > 0 ? (
            <p className="text-center text-[10px] text-muted-foreground">
              {phraseCount} phrase markers · {markers.length} total markers on timeline
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}

export function AudioPanelJumpButton() {
  const { setSettingsPanelView } = useEditor();
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="h-7 shrink-0 gap-1 text-xs"
      onClick={() => setSettingsPanelView("audio")}
    >
      <Mic className="h-3 w-3" />
      Audio
    </Button>
  );
}
