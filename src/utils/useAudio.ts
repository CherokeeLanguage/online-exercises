import { useState, useMemo, useEffect } from "react";

export interface UseAudioProps {
  src: string;
  autoplay?: boolean;
}

export interface UseAudioReturn {
  audio: HTMLAudioElement;
  play: (restartOk?: boolean) => void;
  playing: boolean;
}

export function useAudio({
  src,
  autoplay = false,
}: UseAudioProps): UseAudioReturn {
  const [playing, setPlaying] = useState(false);

  const audio = useMemo(() => new Audio(src), [src]);

  useEffect(() => {
    if (autoplay) {
      audio.oncanplay = () => {
        setPlaying(true);
        audio.play();
      };
    }
    audio.onended = () => {
      setPlaying(false);
    };
    return () => {
      audio.oncanplay = () => {};
      if (!audio.paused) {
        setPlaying(false);
        audio.pause();
      }
    };
  }, [audio, autoplay]);

  return {
    play(restartOk = false) {
      if (restartOk) {
        setPlaying(true);
        audio.currentTime = 0;
        audio.play();
      } else if (!playing) {
        setPlaying(true);
        audio.play();
      }
    },
    playing,
    audio,
  };
}
