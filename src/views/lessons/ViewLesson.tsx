import React, { ReactElement } from "react";
import { Navigate, useParams } from "react-router-dom";
import { Card, cards, keyForCard } from "../../data/clean-cll-data";
import { nameForLesson } from "../../state/reducers/lessons";
import { ReviewResult } from "../../state/reducers/leitnerBoxes";
import { useCardsForTerms } from "../../utils/useCardsForTerms";
import { useLesson } from "../../state/useLesson";
import { SectionHeading } from "../../components/SectionHeading";
import { StyledTable } from "../../components/StyledTable";

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
              <StyledTable>
                <thead>
                  <tr>
                    <th>Syllabary</th>
                    <th>English translation</th>
                  </tr>
                </thead>
                <tbody>
                  {cards.map((card) => (
                    <tr>
                      <td>{card.syllabary}</td>
                      <td>{card.english}</td>
                    </tr>
                  ))}
                </tbody>
              </StyledTable>
            </div>
          )
      )}
    </div>
  );
}
