import React, { ReactElement, useState, useMemo, useEffect } from "react";
import styled, { css } from "styled-components";
// @ts-ignore
import trigramSimilarity from "trigram-similarity";
import { Card, cards, keyForCard } from "../data/clean-cll-data";
import { useAudio } from "../utils/useAudio";
import { useTransition } from "../utils/useTransition";
import SHA256 from "crypto-js/sha256";
import { useParams } from "react-router-dom";
import { termsByLesson } from "../data/clean-cll-data";
import { useLeitnerBoxContext } from "../utils/LeitnerBoxProvider";
import {
  TermCardWithStats,
  useLeitnerReviewSession,
} from "../utils/useLeitnerReviewSession";
import { useCardsForTerms } from "../utils/useCardsForTerms";

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

const LESSON_CARDS = cards.slice(0, 20);
const LESSON_HASH = SHA256(
  LESSON_CARDS.map((c) => c.cherokee).join("|")
).toString();

function lessonNameValid(lessonName: string): boolean {
  return lessonName in termsByLesson;
}

function getTerms(lessonName: string, cummulative: boolean): string[] {
  if (!cummulative) return termsByLesson[lessonName];

  const allLessons = Object.keys(
    termsByLesson
  ) as (keyof typeof termsByLesson)[];

  const lessonIdx = allLessons.findIndex((lesson) => lesson === lessonName);
  const lessonsInSession = allLessons.slice(0, lessonIdx + 1);

  return lessonsInSession.flatMap((lesson) => termsByLesson[lesson]);
}

export function SimilarTermsForLesson(): ReactElement {
  const { lessonName, cumulative: rawCumulative } = useParams();
  const cumulative = rawCumulative?.toLowerCase() === "true";
  if (!lessonName) throw new Error("Lesson name is required");
  if (!lessonNameValid(lessonName)) throw new Error("Lesson name not found");

  const lessonTerms = useMemo(
    () => getTerms(lessonName, cumulative),
    [lessonName, cumulative]
  );
  return <SimilarTerms lessonTerms={lessonTerms} />;
}

export function SimilarTermsAllSeenTerms(): ReactElement {
  const leitnerBoxes = useLeitnerBoxContext();

  const lessonTerms = useMemo(
    () => Object.keys(leitnerBoxes.state.terms),
    [leitnerBoxes.state.terms]
  );
  return <SimilarTerms lessonTerms={lessonTerms} />;
}

export function SimilarTerms({
  lessonTerms,
}: {
  lessonTerms: string[];
}): ReactElement {
  const lessonCards = useCardsForTerms(cards, lessonTerms, keyForCard);

  const leitnerBoxes = useLeitnerBoxContext();
  const { ready, currentCard, reviewCurrentCard } = useLeitnerReviewSession(
    leitnerBoxes,
    lessonCards
  );

  const challenge = useMemo(
    () => newChallenge(currentCard, lessonCards),
    [currentCard]
  );

  const done = useMemo(
    () => currentCard?.stats?.nextShowTime > Date.now() + 1000 * 60 * 60,
    [currentCard]
  );

  if (!ready) return <p> Loading...</p>;
  if (done)
    return (
      <>
        <p>
          You've reviewed these cards as much as you should today. Time to take
          a break or learn some more vocabulary.
        </p>
        <p>
          Come back in{" "}
          {Math.floor(
            (currentCard.stats.nextShowTime - Date.now()) / 1000 / 60 / 60
          )}{" "}
          hours
        </p>
      </>
    );
  else
    return (
      <SimilarTermsGame
        challenge={challenge}
        reviewCurrentCard={reviewCurrentCard}
      />
    );
}

function SimilarTermsGame({
  challenge,
  reviewCurrentCard,
}: {
  challenge: Challenge;
  reviewCurrentCard: (correct: boolean) => void;
}) {
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
