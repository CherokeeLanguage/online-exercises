import React, { ReactElement, useState, useMemo, useEffect } from "react";
import styled, { css } from "styled-components";
// @ts-ignore
import trigramSimilarity from "trigram-similarity";
import { Card } from "../../data/cards";
import { TermCardWithStats } from "../../spaced-repetition/types";
import { theme } from "../../theme";
import { createIssueForAudioInNewTab } from "../../utils/createIssue";
import { useAudio } from "../../utils/useAudio";
import { useTransition } from "../../utils/useTransition";
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
      <button
        onClick={() =>
          createIssueForAudioInNewTab(
            [cherokee_audio],
            JSON.stringify({
              term: currentCard.term,
            })
          )
        }
      >
        Flag an issue with this audio
      </button>
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
      background: ${theme.colors.DARK_GREEN};
    `}
  ${({ answerState, correct }) =>
    !correct &&
    answerState === AnswerState.INCORRECT &&
    css`
      background: ${theme.colors.DARK_RED};
    `}
  padding: 24px;
  font-size: ${theme.fontSizes.sm};
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
