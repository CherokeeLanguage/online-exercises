import React, { ReactElement, useState, useMemo, useEffect } from "react";
import styled, { css } from "styled-components";
// @ts-ignore
import trigramSimilarity from "trigram-similarity";
import { Card } from "../data/clean-cll-data";
import { TermCardWithStats } from "../spaced-repetition/types";
import { useAudio } from "../utils/useAudio";
import { useTransition } from "../utils/useTransition";
import { ExerciseComponentProps } from "./Exercise";

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

const Answers = styled.div<{ transitioning: boolean }>`
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  transition-property: opacity 250msec;
  opacity: ${({ transitioning }) => (transitioning ? "70%" : "100%")};
`;

enum AnswerState {
  CORRECT = "CORRECT",
  INCORRECT = "INCORRECT",
  UNANSWERED = "UNANSWERED",
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

  const [answerState, setAnswerState] = useState(AnswerState.UNANSWERED);
  const { transitioning, startTransition } = useTransition({ duration: 250 });

  function onTermClicked(correct: boolean) {
    setAnswerState(correct ? AnswerState.CORRECT : AnswerState.INCORRECT);
    startTransition(() => {
      reviewCurrentCard(correct);
      setAnswerState(AnswerState.UNANSWERED);
    });
  }

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
    <div
      style={{
        display: "grid",
      }}
    >
      {/* <p> {leitnerBoxState.cardsToReview.length} left in session </p> */}
      <button onClick={play} disabled={playing}>
        Listen again
      </button>
      <Answers transitioning={transitioning}>
        {challenge.terms.map((term, idx) => (
          <AnswerCard
            key={idx}
            term={term}
            onClick={() => onTermClicked(idx === challenge.correctTermIdx)}
            correct={idx === challenge.correctTermIdx}
            answerState={answerState}
          />
        ))}
      </Answers>
      {/* <Progress cardsPerLevel={cardsPerLevel} /> */}
    </div>
  );
}

function Progress({ cardsPerLevel }: { cardsPerLevel: number[] }) {
  const totalCards = cardsPerLevel.reduce((sum, count) => sum + count);
  const cardGeometry = cardsPerLevel.reduce<
    {
      x: number;
      width: number;
    }[]
  >(
    (attrs, count) => [
      ...attrs,
      {
        x:
          (attrs[attrs.length - 1]?.width ?? 0) +
          (attrs[attrs.length - 1]?.x ?? 0),
        width: Math.round((count / totalCards) * 100),
      },
    ],
    []
  );
  return (
    <div style={{ display: "flex", padding: 16 }}>
      {cardsPerLevel.map(
        (count, idx) =>
          count > 0 && (
            <div
              style={{
                flex: count,
                border: "1px solid #444",
                height: "8px",
                background: `rgb(${Math.round(
                  (1 - idx / (cardGeometry.length - 1)) * 255
                )},${Math.round((idx / (cardGeometry.length - 1)) * 255)},0)`,
              }}
            />
          )
      )}
    </div>
  );
  return (
    <div style={{ padding: 16 }}>
      <svg viewBox="0 0 100 10" width="100%">
        {cardGeometry.map((geo, idx) => (
          <rect
            width={geo.width}
            x={geo.x}
            height="10"
            style={{
              fill: `rgb(${Math.round(
                (1 - idx / (cardGeometry.length - 1)) * 255
              )},${Math.round((idx / (cardGeometry.length - 1)) * 255)},0)`,
              strokeWidth: "1",
              stroke: "rgb(0,0,0)",
            }}
          />
        ))}
      </svg>
    </div>
  );
}

const StyledAnswerCard = styled.button<{
  answerState: AnswerState;
  correct: boolean;
}>`
  background: #111;
  border: 1px solid #222;
  ${({ answerState, correct }) =>
    correct &&
    answerState === AnswerState.CORRECT &&
    css`
      background: #151;
    `}
  ${({ answerState, correct }) =>
    !correct &&
    answerState === AnswerState.INCORRECT &&
    css`
      background: #611;
    `}
  padding: 24px;
  font-size: 16px;
  margin: 16px;
  color: white;
  flex: 1;
`;

function AnswerCard({
  term,
  onClick,
  correct,
  answerState,
}: {
  term: Card;
  onClick: () => void;
  correct: boolean;
  answerState: AnswerState;
}): ReactElement {
  return (
    <StyledAnswerCard
      onClick={onClick}
      answerState={answerState}
      correct={correct}
    >
      {term.english}
    </StyledAnswerCard>
  );
}
