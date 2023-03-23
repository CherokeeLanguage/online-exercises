import React, { ReactElement } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Card, cards, keyForCard } from "../../data/cards";
import { nameForLesson } from "../../state/reducers/lessons";
import { ReviewResult } from "../../state/reducers/leitnerBoxes";
import { useCardsForTerms } from "../../utils/useCardsForTerms";
import { LessonProvider, useLesson } from "../../providers/LessonProvider";
import { SectionHeading } from "../../components/SectionHeading";
import { CardTable } from "../../components/CardTable";
import { StyledLink } from "../../components/StyledLink";
import { useAnalyticsPageName } from "../../firebase/hooks";
import { LessonsPath } from "../../routing/paths";

export function ViewLesson(): ReactElement {
  useAnalyticsPageName("View lesson");
  const { lessonId } = useParams();
  const navigate = useNavigate();
  if (!lessonId) return <Navigate to={LessonsPath} replace />;
  return (
    <LessonProvider
      lessonId={lessonId}
      onLessonDoesNotExist={() => navigate("/lessons", { replace: true })}
    >
      <_ViewLesson />
    </LessonProvider>
  );
}

const reviewResultNames: Record<ReviewResult, string> = {
  ALL_CORRECT: "All correct",
  SINGLE_MISTAKE: "Only one mistake",
  REPEAT_MISTAKE: "Multiple mistakes",
};

export function _ViewLesson(): ReactElement {
  const { lesson, reviewedTerms } = useLesson();
  const reviewedCards = useCardsForTerms(
    cards,
    Object.keys(reviewedTerms),
    keyForCard
  );

  const reviewedCardsByStatus: Record<ReviewResult, Card[]> = Object.entries(
    reviewedTerms
  ).reduce<Record<ReviewResult, Card[]>>(
    (grouped, [term, reviewResult]) => ({
      ...grouped,
      [reviewResult]: [...grouped[reviewResult], reviewedCards[term]],
    }),
    {
      [ReviewResult.ALL_CORRECT]: [],
      [ReviewResult.SINGLE_MISTAKE]: [],
      [ReviewResult.REPEAT_MISTAKE]: [],
    }
  );
  return (
    <div>
      <SectionHeading>Lesson debrief - {nameForLesson(lesson)}</SectionHeading>
      <p>
        Take a look at how you did! If you were confused by a term, go ahead and
        listen to all the alternate pronouncations by hitting the "More" button.
      </p>
      <p>
        Head back to the <StyledLink to="/">dashboard</StyledLink> to keep
        learning!
      </p>
      {Object.entries(reviewedCardsByStatus).map(
        ([result, cards]) =>
          cards.length > 0 && (
            <div>
              <h3>{reviewResultNames[result as ReviewResult]}</h3>
              <CardTable cards={cards} />
            </div>
          )
      )}
    </div>
  );
}
