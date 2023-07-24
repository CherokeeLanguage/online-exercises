import { useReviewedTerms } from "../spaced-repetition/useReviewSession";
import { Lesson, reduceLesson } from "../state/reducers/lessons";
import { ReviewResult } from "../state/reducers/leitnerBoxes";
import { useUserStateContext } from "./UserStateProvider";
import { analytics } from "../firebase";
import { logEvent } from "firebase/analytics";
import { FirebaseState, useFirebaseLessonMetadata } from "../firebase/hooks";
import { useAuth } from "../firebase/AuthProvider";
import { LessonsAction } from "../state/actions";
import React, { ReactNode, useContext, useEffect, useMemo } from "react";
import { Loader, SmallLoader } from "../components/Loader";
import { AudioCacheProvider } from "./AudioCacheProvider";
import { useCardsForTerms } from "../utils/useCardsForTerms";
import { cards, keyForCard } from "../data/cards";

interface UseLessonData {
  lesson: Lesson;
  reviewedTerms: Record<string, ReviewResult>;
  reviewTerm: (term: string, correct: boolean) => void;
  concludeLesson: () => void;
  startLesson: () => void;
}

const lessonContext = React.createContext<UseLessonData | null>(null);

/**
 * Internal and messy use lesson that can have load times
 */
function useLessonInternal(lessonId: string): FirebaseState<UseLessonData> {
  const { dispatch: dispatchGlobal } = useUserStateContext();
  const { user } = useAuth();
  const reviewedTerms = useReviewedTerms(lessonId);

  const [firebaseLesson, setLesson] = useFirebaseLessonMetadata(user, lessonId);

  if (!firebaseLesson.ready) return firebaseLesson;

  // we didn't find anything
  if (firebaseLesson.data === null) return { data: null, ready: true };

  const { data: lesson } = firebaseLesson;

  function dispatch(action: LessonsAction) {
    dispatchGlobal(action);
    const newLesson = reduceLesson(lesson, action);
    return setLesson(newLesson);
  }

  return {
    ready: true,
    data: {
      lesson,
      ...reviewedTerms,
      concludeLesson: () => {
        logEvent(analytics, "lesson_finished", {
          lessonId: lesson.id,
        });
        dispatch({
          type: "CONCLUDE_LESSON",
          lesson,
          reviewedTerms: reviewedTerms.reviewedTerms,
        });
      },
      startLesson: () => {
        logEvent(analytics, "lesson_started", {
          lessonId,
        });
        dispatch({
          type: "START_LESSON",
          lessonId,
        });
      },
    },
  };
}

export function useLesson(): UseLessonData {
  const result = useContext(lessonContext);
  if (result === null)
    throw new Error("Use lesson must be used inside a LessonProvider");
  return result;
}

export function LessonProvider({
  lessonId,
  onLessonDoesNotExist,
  children,
}: {
  lessonId: string;
  onLessonDoesNotExist: () => void;
  children?: ReactNode;
}) {
  const result = useLessonInternal(lessonId);

  useEffect(() => {
    if (result.ready && result.data === null) {
      onLessonDoesNotExist();
    }
  }, [result]);

  const termCards = useCardsForTerms(
    cards,
    result.ready && result.data !== null ? result.data.lesson.terms : [],
    keyForCard
  );

  const audioToCache = useMemo(() => {
    if (result.ready && result.data !== null) {
      return Object.values(termCards).flatMap((card) => [
        ...card.cherokee_audio,
        ...card.english_audio,
      ]);
    }
    return [];
  }, [result]);

  if (!result.ready)
    return <SmallLoader below={<p>Fetching lesson data...</p>} />;
  if (result.data === null) return <em>Lesson not found</em>;

  return (
    <lessonContext.Provider value={result.data}>
      <AudioCacheProvider audioUrls={audioToCache}>
        {children}
      </AudioCacheProvider>
    </lessonContext.Provider>
  );
}
