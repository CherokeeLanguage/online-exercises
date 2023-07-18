import styled from "styled-components";
import { theme } from "../../theme";
import { AlignedCherokee } from "../AlignedCherokee";
import { ExerciseComponentProps } from "../exercises/Exercise";
import { useUserStateContext } from "../../providers/UserStateProvider";
import { getPhonetics } from "../../utils/phonetics";
import { useMemo, useState } from "react";
import { useAudio } from "../../utils/useAudio";
import { pickRandomElement } from "../exercises/utils";
import { ListenAgainButton } from "../ListenAgainButton";
import { IconButton } from "../IconButton";
import { GrNext } from "react-icons/gr";
import { ActionRow } from "../ActionRow";
import { FlagIssueButton } from "../FlagIssueModal";
import { Challenge } from "./Challenge";

import { MultipleChoiceQuestion } from "./MultipleChoiceQuestion";

export function NewTermIntroduction(props: ExerciseComponentProps) {
  const [showExampleQuestion, setShowExampleQuestion] = useState(false);

  return showExampleQuestion ? (
    <MultipleChoiceQuestion {...props}></MultipleChoiceQuestion>
  ) : (
    <Introduction {...props} setShowExampleQuestion={setShowExampleQuestion} />
  );
}

export function Introduction({
  currentCard,
  setShowExampleQuestion,
}: ExerciseComponentProps & {
  setShowExampleQuestion: (show: boolean) => void;
}) {
  const {
    config: { phoneticsPreference },
  } = useUserStateContext();

  const phonetics = useMemo(
    () => getPhonetics(currentCard.card, phoneticsPreference),
    [currentCard, phoneticsPreference]
  );

  const cherokeeAudio = useMemo(
    () => pickRandomElement(currentCard.card.cherokee_audio),
    [currentCard]
  );

  const { play, playing } = useAudio({
    src: cherokeeAudio,
    autoplay: true,
  });
  return (
    <Challenge
      description="Here is a new term for today's lesson."
      after={
        <FlagIssueButton
          problematicAudio={cherokeeAudio}
          card={currentCard.card}
        />
      }
      content={
        <IntroductionContent
          play={play}
          playing={playing}
          currentCard={currentCard}
          phonetics={phonetics}
          setShowExampleQuestion={setShowExampleQuestion}
        />
      }
    />
  );
}

function IntroductionContent({
  play,
  playing,
  currentCard,
  phonetics,
  setShowExampleQuestion,
}: {
  play: () => void;
  playing: boolean;
  currentCard: ExerciseComponentProps["currentCard"];
  phonetics: string;
  setShowExampleQuestion: (showExampleQuestion: boolean) => void;
}) {
  return (
    <>
      <div>
        <ActionRow
          action={<ListenAgainButton playAudio={play} playing={playing} />}
        >
          <AlignedCherokee
            syllabary={currentCard.card.syllabary}
            phonetics={phonetics}
          ></AlignedCherokee>
        </ActionRow>
      </div>
      <hr />
      <ActionRow
        action={
          <IconButton
            Icon={GrNext}
            onClick={() => setShowExampleQuestion(true)}
          >
            Next
          </IconButton>
        }
      >
        <p>
          <em>{currentCard.card.english}</em>
        </p>
      </ActionRow>
    </>
  );
}
