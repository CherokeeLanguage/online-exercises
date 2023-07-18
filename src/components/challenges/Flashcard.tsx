import { useState, useMemo, ChangeEvent, useId, ReactElement } from "react";
import { AiOutlineCloseCircle, AiOutlineCheckCircle } from "react-icons/ai";
import { useKeyPressEvent } from "react-use";
import { useAudio } from "../../utils/useAudio";
import styled from "styled-components";
import { Card } from "../../data/cards";
import { useUserStateContext } from "../../providers/UserStateProvider";
import { TermCardWithStats } from "../../spaced-repetition/types";
import { theme } from "../../theme";
import { getPhonetics } from "../../utils/phonetics";
import { FlagIssueButton } from "../FlagIssueModal";
import { IconButton } from "../IconButton";
import { ListenAgainButton } from "../ListenAgainButton";
import { ChallengeContainer } from "./styled";
import { pickRandomElement } from "../exercises/utils";
import { AlignedCherokee } from "../AlignedCherokee";
import { ExerciseComponentProps } from "../exercises/Exercise";

const StyledFlashcardBody = styled.button`
  border: none;
  border-radius: 8px;
  width: 100%;
  min-height: 200px;
  margin: 30px auto;
  padding: 8px;
  display: block;
  align-items: center;
  outline: none;
  background: none;
  transition: box-shadow 0.1s linear;
  box-shadow: 2px 2px 8px #6664;
  font-size: ${theme.fontSizes.lg};
  &:hover {
    /* border: 1px solid #333; */
    box-shadow: 2px 2px 8px #666a;
    /* background: ${theme.colors.LIGHTER_GRAY}; */
  }
  p {
    flex: 1;
    /* text-align: left; */
    text-align: center;
    margin: 0;
  }
`;

export function Flashcard({
  currentCard,
  reviewCurrentCard,
}: ExerciseComponentProps) {
  const {
    config: { phoneticsPreference },
  } = useUserStateContext();

  const [cardFlipped, setCardFlipped] = useState(false);
  const [startSide, setStartSide] = useState<"cherokee" | "english">(
    "cherokee"
  );
  const [side, setSide] = useState(startSide);

  const phonetics = useMemo(
    () => getPhonetics(currentCard.card, phoneticsPreference),
    [currentCard, phoneticsPreference]
  );

  function flipCard() {
    setSide(side === "cherokee" ? "english" : "cherokee");
    setCardFlipped(true);
  }

  function reviewCardAndResetState(correct: boolean) {
    reviewCurrentCard(correct);
    setSide(startSide);
    setCardFlipped(false);
  }

  function reviewCardOrFlip(correct: boolean) {
    if (cardFlipped) {
      reviewCardAndResetState(correct);
    } else {
      flipCard();
    }
  }

  function shouldIgnoreKeyboardEvent(event: KeyboardEvent) {
    // this makes sure we bail if the keyboard event was targeted outside of the exercise (eg. at the issue modal)
    return (
      event.target instanceof HTMLElement &&
      event.target !== document.body &&
      !document.getElementById("root")!.contains(event.target)
    );
  }

  useKeyPressEvent(" ", (event) => {
    if (shouldIgnoreKeyboardEvent(event)) return;
    event.preventDefault(); // sometimes button will try to get clicked too
    event.stopPropagation();
    flipCard();
  });

  useKeyPressEvent("x", (event) => {
    if (shouldIgnoreKeyboardEvent(event)) return;
    reviewCardOrFlip(false);
  });

  useKeyPressEvent("Enter", (event) => {
    if (shouldIgnoreKeyboardEvent(event)) return;
    event.preventDefault(); // sometimes the button will try to get clicked too
    event.stopPropagation();
    reviewCardOrFlip(true);
  });

  function onStartSideChange(e: ChangeEvent<HTMLSelectElement>) {
    e.preventDefault();
    const value = e.target.value;
    if (value === "cherokee" || value === "english") {
      setStartSide(value);
    } else {
      console.warn("Unrecognized start side!!");
    }
  }

  // pick random voice to use
  const [cherokeeAudio, englishAudio] = useMemo(() => {
    return [
      pickRandomElement(currentCard.card.cherokee_audio),
      pickRandomElement(currentCard.card.english_audio),
    ];
  }, [currentCard]);

  const { play, playing } = useAudio({
    src: side === "cherokee" ? cherokeeAudio : englishAudio,
    autoplay: true,
  });

  const selectId = useId();

  return (
    <ChallengeContainer>
      <form>
        <label htmlFor={selectId}>Start with</label>
        <select id={selectId} value={startSide} onChange={onStartSideChange}>
          <option value="cherokee">Cherokee</option>
          <option value="english">English</option>
        </select>
      </form>
      <StyledFlashcardBody onClick={() => flipCard()}>
        {side === "english" ? (
          <p>{currentCard.card.english}</p>
        ) : (
          <AlignedCherokee
            syllabary={currentCard.card.syllabary}
            phonetics={phonetics}
          ></AlignedCherokee>
        )}
      </StyledFlashcardBody>
      <FlashcardControls
        playAudio={play}
        reviewCard={reviewCardOrFlip}
        playing={playing}
      />
      <FlagIssueButton
        problematicAudio={cherokeeAudio}
        card={currentCard.card}
      />
    </ChallengeContainer>
  );
}

function FlashcardControls({
  reviewCard,
  playAudio,
  playing,
}: {
  reviewCard: (correct: boolean) => void;
  playAudio: () => void;
  playing: boolean;
}): ReactElement {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-around",
        marginBottom: "16px",
      }}
    >
      <div style={{ flex: "1" }}>
        <IconButton
          Icon={AiOutlineCloseCircle}
          onClick={() => reviewCard(false)}
          color={theme.colors.DARK_RED}
        >
          Answered incorrectly
        </IconButton>
      </div>
      <div style={{ flex: "1" }}>
        <ListenAgainButton playAudio={playAudio} playing={playing} />
      </div>
      <div style={{ flex: "1" }}>
        <IconButton
          Icon={AiOutlineCheckCircle}
          onClick={() => reviewCard(true)}
          color={theme.colors.DARK_GREEN}
        >
          Answered correctly
        </IconButton>
      </div>
    </div>
  );
}
