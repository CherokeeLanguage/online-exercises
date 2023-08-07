import { IconButton } from "./IconButton";
import { AiOutlineSound } from "react-icons/ai";

export interface ListenButonProps {
  playAudio: () => void;
  playing: boolean;
}

export function ListenButton({ playAudio, playing }: ListenButonProps) {
  return (
    <IconButton
      onClick={() => playAudio()}
      Icon={AiOutlineSound}
      disabled={playing}
    >
      Listen
    </IconButton>
  );
}
