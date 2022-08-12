import React, { ReactElement } from "react";
import { Navigate, useParams } from "react-router-dom";
import { cards, keyForCard } from "../../data/clean-cll-data";
import {
  Lesson,
  nameForLesson,
  useLessons,
} from "../../spaced-repetition/LessonsProvider";
import { ReviewResult } from "../../spaced-repetition/useLeitnerBoxes";
import { useReviewedTerms } from "../../spaced-repetition/useReviewSession";
import { useCardsForTerms } from "../../utils/useCardsForTerms";

export function ViewLesson(): ReactElement {
  const { lessonId } = useParams();
  const { lessons } = useLessons();
  if (!lessonId) return <Navigate to={"/lessons"} replace />;
  const lesson = lessons[lessonId];
  return <_ViewLesson lesson={lesson} />;
}

const reviewResultNames: Record<ReviewResult, string> = {
  ALL_CORRECT: "All correct!",
  SINGLE_MISTAKE: "Only one mistake.",
  REPEAT_MISTAKE: "Multiple mistakes.",
};

export function _ViewLesson({ lesson }: { lesson: Lesson }): ReactElement {
  const { reviewedTerms } = useReviewedTerms(lesson.id);
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
