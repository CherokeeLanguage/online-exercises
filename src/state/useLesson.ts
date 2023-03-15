import { useReviewedTerms } from "../spaced-repetition/useReviewSession";
import { Lesson } from "./reducers/lessons";
import { ReviewResult } from "./reducers/leitnerBoxes";
import { useUserStateContext } from "./UserStateProvider";
import { LessonCreationError } from "./reducers/lessons/createNewLesson";

interface UseLessonReturn {
  lesson: Lesson;
  reviewedTerms: Record<string, ReviewResult>;
  reviewTerm: (term: string, correct: boolean) => void;
  concludeLesson: () => void;
  startLesson: () => void;
}

/**
 * Maybe this is a great time to use context!?
 */
export function useLesson(lessonId: string): UseLessonReturn {
  const { lessons, concludeLesson, startLesson } = useUserStateContext();
  const reviewedTerms = useReviewedTerms(lessonId);
  const lesson = lessons[lessonId];

  if (!lesson) throw new Error(`Lesson ${lessonId} not found`);

  return {
    lesson,
    ...reviewedTerms,
    concludeLesson: () => concludeLesson(lesson, reviewedTerms.reviewedTerms),
    startLesson: () => startLesson(lessonId),
  };
}
