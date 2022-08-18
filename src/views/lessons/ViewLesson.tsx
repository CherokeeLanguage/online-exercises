import React, { ReactElement } from "react";
import { Navigate, useParams } from "react-router-dom";
import { Card, cards, keyForCard } from "../../data/clean-cll-data";
import { nameForLesson } from "../../state/reducers/lessons";
import { ReviewResult } from "../../state/reducers/leitnerBoxes";
import { useCardsForTerms } from "../../utils/useCardsForTerms";
import { useLesson } from "../../state/useLesson";
import { SectionHeading } from "../../components/SectionHeading";
import { CardTable } from "../../components/CardTable";

export function ViewLesson(): ReactElement {
  const { lessonId } = useParams();
  if (!lessonId) return <Navigate to={"/lessons"} replace />;
  return <_ViewLesson lessonId={lessonId} />;
}

const reviewResultNames: Record<ReviewResult, string> = {
  ALL_CORRECT: "All correct",
  SINGLE_MISTAKE: "Only one mistake",
  REPEAT_MISTAKE: "Multiple mistakes",
};

export function _ViewLesson({ lessonId }: { lessonId: string }): ReactElement {
  const { lesson, reviewedTerms } = useLesson(lessonId);
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
      <SectionHeading>{nameForLesson(lesson)}</SectionHeading>
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
