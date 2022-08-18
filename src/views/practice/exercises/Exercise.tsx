import { ReactElement, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, cards, keyForCard } from "../../../data/clean-cll-data";
import { TermCardWithStats } from "../../../spaced-repetition/types";
import { useLesson } from "../../../state/useLesson";
import { useReviewSession } from "../../../spaced-repetition/useReviewSession";
import { useCardsForTerms } from "../../../utils/useCardsForTerms";
import { useUserStateContext } from "../../../state/UserStateProvider";

export interface ExerciseComponentProps {
  currentCard: TermCardWithStats<Card>;
  lessonCards: Record<string, Card>;
  reviewCurrentCard: (correct: boolean) => void;
}

export interface ExerciseProps {
  lessonId: string;
  Component: (props: ExerciseComponentProps) => ReactElement;
}

export function Exercise({ lessonId, Component }: ExerciseProps): ReactElement {
  const { leitnerBoxes } = useUserStateContext();
  const { lesson, startLesson, concludeLesson, reviewTerm } =
    useLesson(lessonId);
  const lessonCards = useCardsForTerms(cards, lesson.terms, keyForCard);
  const navigate = useNavigate();

  const { currentCard, reviewCurrentCard, challengesRemaining } =
    useReviewSession(leitnerBoxes, lessonCards, lessonId, reviewTerm);

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
    <>
      <p>{challengesRemaining} challenges left!</p>
      <Component
        currentCard={currentCard}
        lessonCards={lessonCards}
        reviewCurrentCard={reviewCurrentCard}
      />
    </>
  ) : (
    <></>
  );
}
