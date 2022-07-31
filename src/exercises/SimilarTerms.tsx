import React, { ReactElement, useState, useMemo, useEffect } from "react";
import { useLocalStorage } from "react-use";
import styled, { css } from "styled-components";
// @ts-ignore
import trigramSimilarity from "trigram-similarity";
import { Card, cards } from "../clean-cll-data";
import { useAudio } from "../utils/useAudio";
import { LeitnerBoxState, useLeitnerBoxes } from "../utils/useLeitnerBoxes";
import { useTransition } from "../utils/useTransition";

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

export function SimilarTerms(): ReactElement {
  const [storedState, setStoredState] =
    useLocalStorage<LeitnerBoxState<Card> | null>(
      "similar-term-boxes",
      undefined,
      {
        raw: false,
        serializer: JSON.stringify,
        deserializer: JSON.parse,
      }
    );

  const {
    currentCard,
    next,
    state: leitnerBoxState,
  } = useLeitnerBoxes(
    storedState
      ? {
          type: "LOAD",
          state: storedState,
        }
      : {
          type: "NEW",
          numBoxes: 5,
          initialCards: cards,
        }
  );

  useEffect(() => setStoredState(leitnerBoxState), [leitnerBoxState]);

  const challenge = useMemo(() => newChallenge(currentCard), [currentCard]);
  const [answerState, setAnswerState] = useState(AnswerState.UNANSWERED);
  const { transitioning, startTransition } = useTransition({ duration: 250 });

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
