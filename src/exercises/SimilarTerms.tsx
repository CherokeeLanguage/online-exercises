import React, { ReactElement, useState, useMemo } from "react";
import styled, { css } from "styled-components";
// @ts-ignore
import trigramSimilarity from "trigram-similarity";
import { Card, cards } from "../clean-cll-data";
import { useAudio } from "../utils/useAudio";
import { useCachedLeitnerBoxes } from "../utils/useCachedLeitnerBoxes";
import { useTransition } from "../utils/useTransition";
import SHA256 from "crypto-js/sha256";

interface Challenge {
  terms: Card[];
  correctTermIdx: number;
}

function newChallenge(correctTerm: Card): Challenge {
  const temptingTerm = cards
    .slice(0)
    .sort(
      (a, b) =>
        trigramSimilarity(b.cherokee, correctTerm.cherokee) -
        trigramSimilarity(a.cherokee, correctTerm.cherokee)
    )[1 + Math.floor(Math.random() * 2)]; // get a close match

  const correctTermIdx = Math.floor(Math.random() * 2);

  return {
    terms:
      correctTermIdx === 0
        ? [correctTerm, temptingTerm]
        : [temptingTerm, correctTerm],
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

const LESSON_CARDS = cards.slice(0, 20);
const LESSON_HASH = SHA256(
  LESSON_CARDS.map((c) => c.cherokee).join("|")
).toString();

export function SimilarTerms(): ReactElement {
  const {
    currentCard,
    next,
    state: leitnerBoxState,
  } = useCachedLeitnerBoxes({
    localStorageKey: `similar-terms-v2-${LESSON_HASH}`,
    initialCards: cards.slice(0, 20),
    allCards: cards,
    numBoxes: 5,
  });

  const challenge = useMemo(() => newChallenge(currentCard), [currentCard]);
  const [answerState, setAnswerState] = useState(AnswerState.UNANSWERED);
  const { transitioning, startTransition } = useTransition({ duration: 250 });

  const cardsPerLevel = useMemo(() => {
    return leitnerBoxState.cardsToReview.reduce(
      (counts, card) => counts.map((c, i) => (i === card.box ? c + 1 : c)),
      leitnerBoxState.boxes.map((box) => box.length)
    );
  }, [leitnerBoxState]);

  function onTermClicked(correct: boolean) {
    setAnswerState(correct ? AnswerState.CORRECT : AnswerState.INCORRECT);
    startTransition(() => {
      next(correct);
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
      <p> {leitnerBoxState.cardsToReview.length} left in session </p>
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
      <Progress cardsPerLevel={cardsPerLevel} />
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
