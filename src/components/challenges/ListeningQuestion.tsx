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
import { ListenAgainButton } from "../ListenAgainButton";
import { ExerciseComponentProps } from "../exercises/Exercise";
import {
  pickNRandom,
  spliceInAtRandomIndex,
  pickRandomElement,
} from "../exercises/utils";
import {
  ChallengeCard,
  ChallengeContainer,
  ChallengeContent,
  ChallengeDescription,
  StyledControl,
  StyledControlRow,
} from "./styled";
import { PhoneticsPreference } from "../../state/reducers/phoneticsPreference";
import { getPhonetics } from "../../utils/phonetics";
import { Challenge } from "./Challenge";
import { ActionRow } from "../ActionRow";
import { AlignedCherokee } from "../AlignedCherokee";
import { useUserStateContext } from "../../providers/UserStateProvider";

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

export function ListeningQuestion({
  currentCard,
  lessonCards,
  reviewCurrentCard,
}: ExerciseComponentProps): ReactElement {
  const challenge = useMemo(
    () => newChallenge(currentCard, lessonCards, 2),
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

  const useAudioReturn = useAudio({
    src: cherokeeAudio,
    autoplay: true,
  });

  return (
    <Challenge
      description="Select the correct translation for the phrase you hear."
      content={
        <ListeningQuestionContent
          {...useAudioReturn}
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
  currentCard,
  reviewCurrentCard,
  play,
  playing,
}: {
  challenge: Challenge;
  currentCard: ExerciseComponentProps["currentCard"];
  reviewCurrentCard: (correct: boolean) => void;
} & UseAudioReturn) {
  return (
    <>
      <StyledControlRow>
        <StyledControl>
          <ListenAgainButton playAudio={play} playing={playing} />
        </StyledControl>
      </StyledControlRow>
      <AnswersWithFeedback
        reviewCurrentCard={reviewCurrentCard}
        hintLocation={"underAnswers"}
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
    <div>
      <p>
        Correct answer: <strong>{options[correctAnswerIdx].syllabary}</strong> /{" "}
        <strong>{options[correctAnswerIdx].english}</strong>
      </p>
      <p>
        <em>
          You said: <strong>{options[selectedAnswer].english}</strong>
        </em>
      </p>
      <Button onClick={endFeedback}>Continue</Button>
    </div>
  );
}
