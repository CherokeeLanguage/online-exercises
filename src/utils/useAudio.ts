import { useState, useMemo, useEffect, useContext } from "react";
import { audioCacheContext } from "../providers/AudioCacheProvider";

export interface UseAudioProps {
  src: string;
  autoplay?: boolean;
}

export interface UseAudioReturn {
  audio: HTMLAudioElement;
  play: (restartOk?: boolean) => void;
  stop: () => void;
  playing: boolean;
}

const HAVE_ENOUGH_DATA = 4;

export function useAudio({
  src,
  autoplay = false,
}: UseAudioProps): UseAudioReturn {
  const [playing, setPlaying] = useState(false);
  const { getCachedAudio } = useContext(audioCacheContext);

  const audio = useMemo(() => getCachedAudio(src) ?? new Audio(src), [src]);

  useEffect(() => {
    if (autoplay) {
      if (audio.readyState === HAVE_ENOUGH_DATA) {
        console.log("trying to autoplay already loaded audio!");
        setPlaying(true);
        audio.play();
      } else {
        console.log("trying to autoplay not yet loaded audio!");
        audio.oncanplaythrough = () => {
          console.log("autoplaying now...");
          setPlaying(true);
          audio.play().catch((e) => {
            console.log("autoplay failed");
          });
        };
      }
    }
    audio.onended = () => {
      setPlaying(false);
    };
    return () => {
      audio.oncanplaythrough = () => {};
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
    stop() {
      setPlaying(false);
      audio.pause();
    },
    playing,
    audio,
  };
}
