import React, { ReactElement, useMemo } from "react";
import { UseAudioReturn, useAudio } from "../../utils/useAudio";
// @ts-ignore
import trigramSimilarity from "trigram-similarity";
import { Card } from "../../data/cards";
import { TermCardWithStats } from "../../spaced-repetition/types";
import { theme } from "../../theme";
import {
  AnswersWithFeedback,
  AnswerCard,
  useAnswersWithFeedback,
} from "../AnswersWithFeedback";
import { Button } from "../Button";
import { FlagIssueButton } from "../FlagIssueModal";
import { ListenButton } from "../ListenButton";
import { ExerciseComponentProps } from "../exercises/Exercise";
import {
  pickNRandom,
  spliceInAtRandomIndex,
  pickRandomElement,
} from "../exercises/utils";
import { PhoneticsPreference } from "../../state/reducers/phoneticsPreference";
import { getPhonetics } from "../../utils/phonetics";
import { Challenge } from "./Challenge";
import { useUserStateContext } from "../../providers/UserStateProvider";
import { AlignedCherokee } from "../AlignedCherokee";
import { ActionRow } from "../ActionRow";
import { IconButton } from "../IconButton";
import { NextButton } from "../../views/setup/common";
import { GrNext } from "react-icons/gr";
import { StyledControl, StyledControlRow } from "./styled";
import styled from "styled-components";

interface Challenge {
  terms: Card[];
  correctTermIdx: number;
}

function newChallenge(
  correctCard: TermCardWithStats<Card>,
  lessonCards: Record<string, Card>,
  numOptions: number
): Challenge {
  const correctCardPhonetics = getPhonetics(
    correctCard.card,
    PhoneticsPreference.Simple
  );

  const similarTerms = Object.entries(lessonCards)
    .slice(0)
    .sort(
      ([_keyA, cardA], [_keyB, cardB]) =>
        trigramSimilarity(
          getPhonetics(cardB, PhoneticsPreference.Simple),
          correctCardPhonetics
        ) -
        trigramSimilarity(
          getPhonetics(cardA, PhoneticsPreference.Simple),
          correctCardPhonetics
        )
    )
    .slice(1, 1 + Math.ceil(numOptions));

  const temptingCards = pickNRandom(similarTerms, numOptions - 1).map(
    ([_key, card]) => card
  );

  const [correctTermIdx, terms] = spliceInAtRandomIndex(
    temptingCards,
    correctCard.card
  );

  return {
    terms,
    correctTermIdx,
  };
}

export function MultipleChoiceQuestion({
  currentCard,
  lessonCards,
  reviewCurrentCard,
}: ExerciseComponentProps): ReactElement {
  const challenge = useMemo(
    () => newChallenge(currentCard, lessonCards, 4),
    [currentCard]
  );

  // pick random cherokee voice to use
  const cherokeeAudio = useMemo(
    () =>
      pickRandomElement(
        challenge.terms[challenge.correctTermIdx].cherokee_audio
      ),
    [challenge]
  );

  return (
    <Challenge
      description="Select the correct translation for the phrase you hear."
      content={
        <ListeningQuestionContent
          cherokeeAudio={cherokeeAudio}
          challenge={challenge}
          currentCard={currentCard}
          reviewCurrentCard={reviewCurrentCard}
        />
      }
      after={
        <FlagIssueButton
          problematicAudio={cherokeeAudio}
          card={currentCard.card}
        />
      }
    />
  );
}

function ListeningQuestionContent({
  challenge,
  cherokeeAudio,
  currentCard,
  reviewCurrentCard,
}: {
  challenge: Challenge;
  cherokeeAudio: string;
  currentCard: ExerciseComponentProps["currentCard"];
  reviewCurrentCard: (correct: boolean) => void;
}) {
  const {
    config: { phoneticsPreference },
  } = useUserStateContext();
  const phonetics = useMemo(
    () => getPhonetics(currentCard.card, phoneticsPreference),
    [currentCard]
  );

  const { play, playing } = useAudio({
    src: cherokeeAudio,
    autoplay: true,
  });
  return (
    <>
      <ActionRow action={<ListenButton playAudio={play} playing={playing} />}>
        <AlignedCherokee
          syllabary={currentCard.card.syllabary}
          phonetics={phonetics}
        />
      </ActionRow>
      <hr />
      <AnswersWithFeedback
        reviewCurrentCard={reviewCurrentCard}
        hintLocation="underAnswers"
        IncorrectAnswerHint={() => (
          <ListeningQuestionHint
            correctAnswerIdx={challenge.correctTermIdx}
            options={challenge.terms}
          />
        )}
      >
        {challenge.terms.map((term, idx) => (
          <AnswerCard
            key={idx}
            idx={idx}
            correct={idx === challenge.correctTermIdx}
          >
            {term.english}
          </AnswerCard>
        ))}
      </AnswersWithFeedback>
    </>
  );
}

const StyledContinue = styled.div`
  text-align: center;
  margin-top: 20px;
`;

function ListeningQuestionHint({
  correctAnswerIdx,
  options,
}: {
  correctAnswerIdx: number;
  options: Card[];
}): ReactElement {
  const { selectedAnswer, endFeedback } = useAnswersWithFeedback();
  if (selectedAnswer === null)
    throw new Error("Answer should be selected if we are providing feedback");
  return (
    <StyledContinue>
      <IconButton onClick={endFeedback} Icon={GrNext}>
        Continue
      </IconButton>
    </StyledContinue>
  );
}
