import { IconButton } from "./IconButton";
import { AiOutlineSound } from "react-icons/ai";

export interface ListenAgainButonProps {
  playAudio: () => void;
  playing: boolean;
}

export function ListenAgainButton({
  playAudio,
  playing,
}: ListenAgainButonProps) {
  return (
    <IconButton
      onClick={() => playAudio()}
      Icon={AiOutlineSound}
      disabled={playing}
    >
      Listen again
    </IconButton>
  );
}
