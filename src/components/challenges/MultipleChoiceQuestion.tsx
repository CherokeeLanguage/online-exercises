import React, { ReactElement, useMemo } from "react";
import { useAudio } from "../../utils/useAudio";
import { ContinueButton } from "../ContinueButton";
// @ts-ignore
import trigramSimilarity from "trigram-similarity";
import { Card } from "../../data/cards";
import { TermCardWithStats } from "../../spaced-repetition/types";
import { AnswersWithFeedback, AnswerCard } from "../AnswersWithFeedback";
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
        IncorrectAnswerHint={() => <ContinueButton />}
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
