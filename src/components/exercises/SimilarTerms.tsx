import React, { ReactElement, useMemo } from "react";
// @ts-ignore
import trigramSimilarity from "trigram-similarity";
import { Card } from "../../data/cards";
import { TermCardWithStats } from "../../spaced-repetition/types";
import { useAudio } from "../../utils/useAudio";
import { AnswerCard, AnswersWithFeedback } from "../AnswersWithFeedback";
import { ExerciseComponentProps } from "./Exercise";
import { FlagIssueButton } from "../FlagIssueModal";
import { ListenAgainButton } from "../ListenAgainButton";
import { ContentWrapper } from "./ContentWrapper";

interface Challenge {
  terms: Card[];
  correctTermIdx: number;
}

function newChallenge(
  correctCard: TermCardWithStats<Card>,
  lessonCards: Record<string, Card>
): Challenge {
  const temptingTerm = Object.keys(lessonCards)
    .slice(0)
    .sort(
      (a, b) =>
        trigramSimilarity(b, correctCard.card.cherokee) -
        trigramSimilarity(a, correctCard.card.cherokee)
    )[1 + Math.floor(Math.random() * 2)]; // get a close match

  const temptingCard = lessonCards[temptingTerm];

  const correctTermIdx = Math.floor(Math.random() * 2);

  return {
    terms:
      correctTermIdx === 0
        ? [correctCard.card, temptingCard]
        : [temptingCard, correctCard.card],
    correctTermIdx,
  };
}

export function SimilarTerms({
  currentCard,
  lessonCards,
  reviewCurrentCard,
}: ExerciseComponentProps): ReactElement {
  const challenge = useMemo(
    () => newChallenge(currentCard, lessonCards),
    [currentCard]
  );

  // pick random cherokee voice to use
  const cherokee_audio = useMemo(
    () =>
      challenge.terms[challenge.correctTermIdx].cherokee_audio[
        Math.floor(
          Math.random() *
            challenge.terms[challenge.correctTermIdx].cherokee_audio.length
        )
      ],
    [challenge]
  );

  const { play, playing } = useAudio({
    src: cherokee_audio,
    autoplay: true,
  });

  return (
    <div>
      <p>
        Listen to the Cherokee word or phrase and then pick the correct
        translation. Read carefully! We will try to find similar terms for the
        wrong answer.
      </p>
      <ContentWrapper
        style={{
          display: "grid",
        }}
      >
        <ListenAgainButton playAudio={play} playing={playing} />
        <AnswersWithFeedback reviewCurrentCard={reviewCurrentCard}>
          {challenge.terms.map((term, idx) => (
            <AnswerCard key={idx} correct={idx === challenge.correctTermIdx}>
              {term.english}
            </AnswerCard>
          ))}
        </AnswersWithFeedback>
        <FlagIssueButton
          problematicAudio={cherokee_audio}
          card={currentCard.card}
        />
      </ContentWrapper>
    </div>
  );
}
