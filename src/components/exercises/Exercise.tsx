import { ReactElement, ReactNode, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, cards, keyForCard } from "../../data/cards";
import { TermCardWithStats } from "../../spaced-repetition/types";
import { useLesson } from "../../state/useLesson";
import { useReviewSession } from "../../spaced-repetition/useReviewSession";
import { useCardsForTerms } from "../../utils/useCardsForTerms";
import { useUserStateContext } from "../../state/UserStateProvider";
import styled from "styled-components";
import { theme } from "../../theme";
import { practiceLessonLeitnerBoxes } from "../../state/reducers/leitnerBoxes";

export interface ExerciseComponentProps {
  currentCard: TermCardWithStats<Card>;
  lessonCards: Record<string, Card>;
  reviewCurrentCard: (correct: boolean) => void;
}

export interface ExerciseProps {
  lessonId: string;
  Component: (props: ExerciseComponentProps) => ReactElement;
}

const ExerciseWrapper = styled.div`
  margin-bottom: 16px;
`;

export function Exercise({ lessonId, Component }: ExerciseProps): ReactElement {
  const { leitnerBoxes: userLeitnerBoxes } = useUserStateContext();
  const { lesson, startLesson, concludeLesson, reviewTerm } =
    useLesson(lessonId);
  const lessonCards = useCardsForTerms(cards, lesson.terms, keyForCard);
  const navigate = useNavigate();

  const leitnerBoxesForSession = useMemo(
    () =>
      lesson.type === "PRACTICE"
        ? practiceLessonLeitnerBoxes(lesson.terms, userLeitnerBoxes.numBoxes)
        : userLeitnerBoxes,
    [lesson, userLeitnerBoxes]
  );

  const {
    currentCard,
    reviewCurrentCard,
    challengesRemaining,
    numTermsToIntroduce,
    numActiveTerms,
    numFinishedTerms,
  } = useReviewSession(
    leitnerBoxesForSession,
    lessonCards,
    lessonId,
    reviewTerm
  );

  useEffect(() => {
    if (lesson.startedAt === null) startLesson();
  }, [lesson.startedAt]);

  useEffect(() => {
    if (currentCard === undefined) {
      // then we are done!
      concludeLesson();
      navigate(`/lessons/${lessonId}`);
    }
  }, [currentCard]);

  return currentCard ? (
    <ExerciseWrapper>
      <TermStatusProgressBar
        numTermsToIntroduce={numTermsToIntroduce}
        numActiveTerms={numActiveTerms}
        numFinishedTerms={numFinishedTerms}
      />
      <Component
        currentCard={currentCard}
        lessonCards={lessonCards}
        reviewCurrentCard={reviewCurrentCard}
      />
      <ChallengesProgressBar
        challengesRemaining={challengesRemaining}
        totalChallenges={lesson.numChallenges}
      />
    </ExerciseWrapper>
  ) : (
    <></>
  );
}

function ChallengesProgressBar({
  challengesRemaining,
  totalChallenges,
}: {
  challengesRemaining: number;
  totalChallenges: number;
}) {
  const figureHeight = 10;
  return (
    <svg
      width="100%"
      height={figureHeight}
      viewBox={`0 0 ${totalChallenges} ${figureHeight}`}
      preserveAspectRatio="none"
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
      }}
    >
      <rect
        x={0}
        y={0}
        width={totalChallenges}
        height={figureHeight}
        fill={theme.colors.LIGHT_GRAY}
      ></rect>
      <rect
        x={0}
        y={0}
        width={totalChallenges - challengesRemaining}
        height={figureHeight}
        fill={theme.colors.DARK_RED}
      ></rect>
    </svg>
  );
}

function TermStatusProgressBar({
  numTermsToIntroduce,
  numActiveTerms,
  numFinishedTerms,
}: {
  numTermsToIntroduce: number;
  numActiveTerms: number;
  numFinishedTerms: number;
}) {
  // challenges remaining, unseen terms, finished terms
  const barCounts = [numTermsToIntroduce, numActiveTerms, numFinishedTerms];
  const barColors = [
    theme.colors.DARK_RED,
    theme.colors.HARD_YELLOW,
    theme.colors.MED_GREEN,
  ];
  const totalTerms = barCounts.reduce((total, count) => total + count);
  const figureWidth = 100;
  const figureHeight = 4;
  const barWidths = barCounts.map(
    (count) => (count / totalTerms) * figureWidth
  );

  return (
    <svg
      width="100%"
      height={figureHeight}
      preserveAspectRatio="none"
      viewBox="0 0 100 4"
    >
      {
        barWidths.reduce<{ offsetX: number; renderedElements: ReactNode[] }>(
          ({ offsetX, renderedElements }, barWidth, idx) => ({
            offsetX: offsetX + barWidth,
            renderedElements: [
              ...renderedElements,
              <rect
                key={idx}
                x={offsetX}
                y={0}
                width={barWidth}
                height={figureHeight}
                fill={barColors[idx]}
              ></rect>,
            ],
          }),
          { offsetX: 0, renderedElements: [] }
        ).renderedElements
      }
    </svg>
  );
}
