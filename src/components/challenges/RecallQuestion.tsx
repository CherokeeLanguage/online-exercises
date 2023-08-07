import { useState, useMemo, ReactElement, ReactNode } from "react";
import { AiOutlineCloseCircle, AiOutlineCheckCircle } from "react-icons/ai";
import { BiShow } from "react-icons/bi";
import { UseAudioReturn, useAudio } from "../../utils/useAudio";
import styled from "styled-components";
import { useUserStateContext } from "../../providers/UserStateProvider";
import { theme } from "../../theme";
import { getPhonetics } from "../../utils/phonetics";
import { AlignedCherokee } from "../AlignedCherokee";
import { FlagIssueButton } from "../FlagIssueModal";
import { IconButton } from "../IconButton";
import { ListenButton } from "../ListenButton";
import { StyledControlRow, StyledControl } from "./styled";
import { ExerciseComponentProps } from "../exercises/Exercise";
import { pickRandomElement } from "../exercises/utils";
import { ActionRow } from "../ActionRow";
import { Challenge } from "./Challenge";
import { useFeedbackChimes } from "../../utils/useFeedbackChimes";

export function RecallQuestion({
  currentCard,
  reviewCurrentCard,
}: ExerciseComponentProps) {
  const {
    config: { phoneticsPreference },
  } = useUserStateContext();

  const [showAnswer, setShowAnswer] = useState(false);
  const [feedbackPeriod, setFeedbackPeriod] = useState(false);
  const startSide: "cherokee" | "english" = useMemo(
    () => (currentCard.stats.box >= 3 ? "english" : "cherokee"),
    [currentCard]
  );

  const { playCorrectChime, playIncorrectChime } = useFeedbackChimes();

  const phonetics = useMemo(
    () => getPhonetics(currentCard.card, phoneticsPreference),
    [currentCard, phoneticsPreference]
  );

  function revealAnswer() {
    setShowAnswer(true);
    sourceAudio.stop();
    targetAudio.play();
  }

  function reviewCardAndResetState(correct: boolean) {
    if (correct) playCorrectChime();
    else playIncorrectChime();
    setFeedbackPeriod(true);
    setTimeout(() => {
      reviewCurrentCard(correct);
      setShowAnswer(false);
      setFeedbackPeriod(false);
    }, 1500);
  }

  // pick random voice to use
  const [cherokeeAudioSrc, englishAudioSrc] = useMemo(() => {
    return [
      pickRandomElement(currentCard.card.cherokee_audio),
      pickRandomElement(currentCard.card.english_audio),
    ];
  }, [currentCard]);

  const englishAudio = useAudio({
    src: englishAudioSrc,
    autoplay: startSide === "english",
  });

  const cherokeeAudio = useAudio({
    src: cherokeeAudioSrc,
    autoplay: startSide === "cherokee",
  });

  const englishContent = <p>{currentCard.card.english}</p>;

  const cherokeeContent = (
    <AlignedCherokee
      syllabary={currentCard.card.syllabary}
      phonetics={phonetics}
    ></AlignedCherokee>
  );

  const [sourceContent, targetContent] =
    startSide === "english"
      ? [englishContent, cherokeeContent]
      : [cherokeeContent, englishContent];

  const [sourceAudio, targetAudio] =
    startSide === "english"
      ? [englishAudio, cherokeeAudio]
      : [cherokeeAudio, englishAudio];

  return (
    <Challenge
      description={`How do you say the following term in ${
        startSide === "cherokee" ? "English" : "Cherokee"
      }?`}
      content={
        <RecallContent
          sourceContent={sourceContent}
          sourceAudio={sourceAudio}
          targetContent={targetContent}
          targetAudio={targetContent === cherokeeContent ? targetAudio : null}
          showAnswer={showAnswer}
        />
      }
      after={
        <>
          {showAnswer ? (
            <FlashcardControls
              reviewCard={reviewCardAndResetState}
              disabled={feedbackPeriod}
            />
          ) : (
            <StyledControlRow>
              <StyledControl>
                <IconButton Icon={BiShow} onClick={revealAnswer}>
                  Show translation
                </IconButton>
              </StyledControl>
            </StyledControlRow>
          )}
          <FlagIssueButton card={currentCard.card} />
        </>
      }
    />
  );
}

function RecallContent({
  sourceAudio,
  sourceContent,
  targetContent,
  targetAudio,
  showAnswer,
}: {
  sourceAudio: UseAudioReturn;
  sourceContent: ReactNode;
  targetContent: ReactNode;
  targetAudio: UseAudioReturn | null;
  showAnswer: boolean;
}) {
  return (
    <>
      <ActionRow
        action={
          <ListenButton
            playAudio={sourceAudio.play}
            playing={sourceAudio.playing}
          />
        }
      >
        {sourceContent}
      </ActionRow>
      {showAnswer && (
        <>
          <hr />
          <div>
            {targetAudio ? (
              <ActionRow
                action={
                  <ListenButton
                    playAudio={targetAudio.play}
                    playing={targetAudio.playing}
                  />
                }
              >
                {targetContent}
              </ActionRow>
            ) : (
              <em>{targetContent}</em>
            )}
          </div>
        </>
      )}
    </>
  );
}

function FlashcardControls({
  reviewCard,
  disabled,
}: {
  reviewCard: (correct: boolean) => void;
  disabled: boolean;
}): ReactElement {
  return (
    <StyledControlRow>
      <StyledControl>
        <IconButton
          Icon={AiOutlineCloseCircle}
          onClick={() => reviewCard(false)}
          color={theme.colors.DARK_RED}
          disabled={disabled}
        >
          Answered incorrectly
        </IconButton>
      </StyledControl>
      <StyledControl>
        <IconButton
          Icon={AiOutlineCheckCircle}
          onClick={() => reviewCard(true)}
          color={theme.colors.DARK_GREEN}
          disabled={disabled}
        >
          Answered correctly
        </IconButton>
      </StyledControl>
    </StyledControlRow>
  );
}
