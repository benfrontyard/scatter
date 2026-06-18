import { computeMusicVolumeAtTime, isVoiceoverActive } from "@/lib/audio";
import type { ProjectAsset, SequenceAudio } from "@/types";
import { DEFAULT_AUDIO_MIX } from "@/types/audio";
import { Audio, Sequence, useCurrentFrame, useVideoConfig } from "remotion";

type AudioTracksProps = {
  audio?: SequenceAudio;
  assets: ProjectAsset[];
  totalDurationFrames: number;
  /** When true, audio is handled by Web Audio engine — skip Remotion audio */
  muteRemotionAudio?: boolean;
};

function DuckingMusic({
  src,
  mix,
  voAnalysis,
  totalDurationSec,
}: {
  src: string;
  mix: NonNullable<SequenceAudio["mix"]>;
  voAnalysis: SequenceAudio["voiceover"];
  totalDurationSec: number;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timeSec = frame / fps;
  const voActive = isVoiceoverActive(voAnalysis?.analysis, timeSec);
  const volume = computeMusicVolumeAtTime(mix, timeSec, voActive, totalDurationSec);

  return <Audio src={src} volume={volume} />;
}

export function AudioTracks({
  audio,
  assets,
  totalDurationFrames,
  muteRemotionAudio = false,
}: AudioTracksProps) {
  if (!audio || muteRemotionAudio) return null;

  const mix = audio.mix ?? DEFAULT_AUDIO_MIX;
  const { fps } = useVideoConfig();
  const totalDurationSec = totalDurationFrames / fps;

  const voAsset = audio.voiceover
    ? assets.find((a) => a.id === audio.voiceover!.assetId)
    : undefined;
  const musicAsset = audio.music
    ? assets.find((a) => a.id === audio.music!.assetId)
    : undefined;

  return (
    <>
      {musicAsset?.dataUrl ? (
        <DuckingMusic
          src={musicAsset.dataUrl}
          mix={mix}
          voAnalysis={audio.voiceover}
          totalDurationSec={totalDurationSec}
        />
      ) : null}

      {voAsset?.dataUrl ? (
        <Sequence from={0} durationInFrames={totalDurationFrames}>
          <Audio
            src={voAsset.dataUrl}
            volume={mix.voiceoverVolume}
            startFrom={
              audio.voiceover?.trimStart
                ? Math.round(audio.voiceover.trimStart * fps)
                : undefined
            }
            endAt={
              audio.voiceover?.trimEnd
                ? Math.round(audio.voiceover.trimEnd * fps)
                : undefined
            }
          />
        </Sequence>
      ) : null}
    </>
  );
}
