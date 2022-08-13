import React, { ReactElement } from "react";
import { Navigate, useParams } from "react-router-dom";
import { cards, keyForCard } from "../../data/clean-cll-data";
import { Lesson, nameForLesson } from "../../state/reducers/lessons";
import { ReviewResult } from "../../state/reducers/leitnerBoxes";
import { useReviewedTerms } from "../../spaced-repetition/useReviewSession";
import { useCardsForTerms } from "../../utils/useCardsForTerms";
import { useLesson } from "../../state/useLesson";

export function ViewLesson(): ReactElement {
  const { lessonId } = useParams();
  if (!lessonId) return <Navigate to={"/lessons"} replace />;
  return <_ViewLesson lessonId={lessonId} />;
}

const reviewResultNames: Record<ReviewResult, string> = {
  ALL_CORRECT: "All correct!",
  SINGLE_MISTAKE: "Only one mistake.",
  REPEAT_MISTAKE: "Multiple mistakes.",
};

export function _ViewLesson({ lessonId }: { lessonId: string }): ReactElement {
  const { lesson, reviewedTerms } = useLesson(lessonId);
  const reviewedCards = useCardsForTerms(
    cards,
    Object.keys(reviewedTerms),
    keyForCard
  );
  return (
    <div>
      <p>
        {nameForLesson(lesson)} - {new Date(lesson.createdFor).toDateString()}
      </p>
      <ul>
        {Object.entries(reviewedTerms).map(([term, value], idx) => (
          <li key={idx}>
            <h2>
              {reviewedCards[term].syllabary} / {reviewedCards[term].english}
            </h2>
            <p>{reviewResultNames[value]}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
