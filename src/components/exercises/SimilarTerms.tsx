import React, { ReactElement, useMemo } from "react";
// @ts-ignore
import trigramSimilarity from "trigram-similarity";
import { Card } from "../../data/cards";
import { TermCardWithStats } from "../../spaced-repetition/types";
import { useAudio } from "../../utils/useAudio";
import {
  AnswerCard,
  AnswersWithFeedback,
  useAnswersWithFeedback,
} from "../AnswersWithFeedback";
import { ExerciseComponentProps } from "./Exercise";
import { FlagIssueButton } from "../FlagIssueModal";
import { ListenAgainButton } from "../ListenAgainButton";
import { ContentWrapper } from "./ContentWrapper";
import { pickNRandom, pickRandomElement, spliceInAtRandomIndex } from "./utils";
import { Button } from "../Button";

interface Challenge {
  terms: Card[];
  correctTermIdx: number;
}

function newChallenge(
  correctCard: TermCardWithStats<Card>,
  lessonCards: Record<string, Card>,
  numOptions: number
): Challenge {
  const similarTerms = Object.keys(lessonCards)
    .slice(0)
    .sort(
      (a, b) =>
        trigramSimilarity(b, correctCard.card.cherokee) -
        trigramSimilarity(a, correctCard.card.cherokee)
    )
    .slice(1, 1 + Math.ceil((numOptions - 1) * 1.5));
  const temptingTerms = pickNRandom(similarTerms, numOptions - 1);
  const temptingCards = temptingTerms.map((t) => lessonCards[t]);

  const [correctTermIdx, terms] = spliceInAtRandomIndex(
    temptingCards,
    correctCard.card
  );

  return {
    terms,
    correctTermIdx,
  };
}

export function SimilarTerms({
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

  const { play, playing } = useAudio({
    src: cherokeeAudio,
    autoplay: true,
  });

  return (
    <div>
      <p>
        Listen to the Cherokee word or phrase and then pick the correct
        translation. Read carefully! We will try to find similar terms for the
        wrong answer.
      </p>
      <ContentWrapper>
        <ListenAgainButton playAudio={play} playing={playing} />
        <AnswersWithFeedback
          reviewCurrentCard={reviewCurrentCard}
          hintLocation={"underAnswers"}
          IncorrectAnswerHint={() => (
            <SimilarTermsHint
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
        <FlagIssueButton
          problematicAudio={cherokeeAudio}
          card={currentCard.card}
        />
      </ContentWrapper>
    </div>
  );
}

function SimilarTermsHint({
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
