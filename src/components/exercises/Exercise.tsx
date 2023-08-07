import { Fragment, ReactElement, ReactNode, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, cards, keyForCard } from "../../data/cards";
import { TermCardWithStats } from "../../spaced-repetition/types";
import { useLesson } from "../../providers/LessonProvider";
import { useReviewSession } from "../../spaced-repetition/useReviewSession";
import { useCardsForTerms } from "../../utils/useCardsForTerms";
import { useUserStateContext } from "../../providers/UserStateProvider";
import styled from "styled-components";
import { theme } from "../../theme";
import { practiceLessonLeitnerBoxes } from "../../state/reducers/leitnerBoxes";
import { collections, VocabSet, vocabSets } from "../../data/vocabSets";
import { PracticeLesson } from "../../state/reducers/lessons";
import { StyledLink } from "../StyledLink";
import { useAnalyticsPageName } from "../../firebase/hooks";
import { ViewSetPath } from "../../routing/paths";

export interface ExerciseComponentProps {
  currentCard: TermCardWithStats<Card> & { needsIntroduction: boolean };
  lessonCards: Record<string, Card>;
  reviewCurrentCard: (correct: boolean) => void;
}

export interface ExerciseProps {
  name: string;
  Component: (props: ExerciseComponentProps) => ReactElement;
}

const ExerciseWrapper = styled.div`
  padding-bottom: 32px;
`;

export function Exercise(props: ExerciseProps): ReactElement {
  return <ExerciseComponentWrapper {...props} />;
}

function ExerciseComponentWrapper({ Component, name }: ExerciseProps) {
  const { leitnerBoxes: userLeitnerBoxes } = useUserStateContext();
  const { lesson, startLesson, concludeLesson, reviewTerm } = useLesson();

  const lessonCards = useCardsForTerms(cards, lesson.terms, keyForCard);
  const navigate = useNavigate();
  useAnalyticsPageName(`Exercise (${name})`);

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
    lesson.id,
    reviewTerm
  );

  useEffect(() => {
    if (!lesson.startedAt) startLesson();
  }, [lesson.startedAt]);

  useEffect(() => {
    if (currentCard === undefined) {
      // then we are done!
      concludeLesson();
      navigate(`/lessons/${lesson.id}`);
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
      {lesson.type === "PRACTICE" && (
        <PracticeLessonContentsMemo lesson={lesson} />
      )}
      <ChallengesProgressBar
        challengesRemaining={challengesRemaining}
        totalChallenges={lesson.numChallenges}
      />
    </ExerciseWrapper>
  ) : (
    <></>
  );
}

const StyledPracticeLessonContentsMemo = styled.p`
  text-align: center;
  margin-top: 16px;
`;

function PracticeLessonContentsMemo({ lesson }: { lesson: PracticeLesson }) {
  return (
    <StyledPracticeLessonContentsMemo>
      You are seeing terms from:
      {Object.entries(
        lesson.includedSets.reduce<Record<string, VocabSet[]>>(
          (collected, setId) => {
            const set = vocabSets[setId];
            const collection = collections[set.collection];
            return {
              ...collected,
              [collection.title]: [...(collected[collection.title] ?? []), set],
            };
          },
          {}
        )
      ).map(([collectionTitle, sets]) => (
        <p>
          <em>
            <strong>{collectionTitle}</strong>:{" "}
            {sets.map((s, i) => (
              <Fragment key={i}>
                {i > 0 && ", "}
                <StyledLink to={ViewSetPath(s.id)}>{s.title}</StyledLink>
              </Fragment>
            ))}
          </em>
        </p>
      ))}
    </StyledPracticeLessonContentsMemo>
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
        position: "fixed",
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
        fill={theme.hanehldaColors.BORDER_GRAY}
      ></rect>
      <rect
        x={0}
        y={0}
        width={totalChallenges - challengesRemaining}
        height={figureHeight}
        fill={theme.hanehldaColors.DARK_RED}
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
    theme.hanehldaColors.BORDER_GRAY,
    theme.colors.HARD_YELLOW,
    theme.hanehldaColors.LIGHT_GREEN,
  ];
  const totalTerms = barCounts.reduce((total, count) => total + count);
  const figureWidth = 100;
  const figureHeight = 20;
  const barWidths = barCounts.map(
    (count) => (count / totalTerms) * figureWidth
  );

  return (
    <svg
      width="100%"
      height={figureHeight}
      preserveAspectRatio="none"
      viewBox={`0 0 100 ${figureHeight}`}
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
