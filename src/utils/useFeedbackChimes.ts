import { useAudio } from "./useAudio";

export interface UseFeedbackChimesReturn {
  playCorrectChime: () => void;
  playIncorrectChime: () => void;
}

const CORRECT_CHIME_SRC =
  process.env.PUBLIC_URL + "/misc-audio/correct_chime.mp3";
const INCORRECT_CHIME_SRC =
  process.env.PUBLIC_URL + "/misc-audio/incorrect_chime.mp3";

export function useFeedbackChimes(): UseFeedbackChimesReturn {
  const { play: playCorrectChime } = useAudio({
    src: CORRECT_CHIME_SRC,
    autoplay: false,
  });
  const { play: playIncorrectChime } = useAudio({
    src: INCORRECT_CHIME_SRC,
    autoplay: false,
  });
  return {
    playCorrectChime: () => playCorrectChime(true),
    playIncorrectChime: () => playIncorrectChime(true),
  };
}
