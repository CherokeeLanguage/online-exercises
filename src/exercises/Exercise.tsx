import { ReactElement, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, cards, keyForCard } from "../data/clean-cll-data";
import { useLeitnerBoxContext } from "../spaced-repetition/LeitnerBoxProvider";
import { PimsleurStats, TermCardWithStats } from "../spaced-repetition/types";
import { useLesson } from "../spaced-repetition/LessonsProvider";
import { useReviewSession } from "../spaced-repetition/useReviewSession";
import { useCardsForTerms } from "../utils/useCardsForTerms";

export interface ExerciseComponentProps {
  currentCard: TermCardWithStats<Card, PimsleurStats>;
  lessonCards: Record<string, Card>;
  reviewCurrentCard: (correct: boolean) => void;
}

export interface ExerciseProps {
  lessonId: string;
  Component: (props: ExerciseComponentProps) => ReactElement;
}

export function Exercise({ lessonId, Component }: ExerciseProps): ReactElement {
  const leitnerBoxes = useLeitnerBoxContext();
  const [lesson, markLessonCompleted] = useLesson(lessonId);
  const lessonCards = useCardsForTerms(cards, lesson.terms, keyForCard);
  const navigate = useNavigate();

  const { currentCard, reviewedTerms, reviewCurrentCard } = useReviewSession(
    leitnerBoxes,
    lessonCards,
    lessonId
  );

  useEffect(() => {
    if (currentCard === undefined) {
      // then we are done!
      leitnerBoxes.concludeReviewSession(reviewedTerms);
      markLessonCompleted();
      navigate(`/lessons/${lessonId}`);
    }
  }, [currentCard]);

  return currentCard ? (
    <Component
      currentCard={currentCard}
      lessonCards={lessonCards}
      reviewCurrentCard={reviewCurrentCard}
    />
  ) : (
    <></>
  );
}
