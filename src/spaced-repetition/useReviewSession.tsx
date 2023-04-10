import { useEffect, useMemo } from "react";
import { useFirebase, useFirebaseReviewedTerms } from "../firebase/hooks";
import { TermCardWithStats, TermStats } from "./types";
import { LeitnerBoxState, ReviewResult } from "../state/reducers/leitnerBoxes";
import { lessonKey } from "../state/reducers/lessons";
import {
  MAX_SHOW_PER_SESSION,
  PimsleurTimingState,
  showsPerSessionForBox,
  usePimsleurTimings,
} from "./usePimsleurTimings";
import { useAuth } from "../firebase/AuthProvider";
import { useLocalStorage } from "react-use";

export interface UseLeitnerReviewSessionReturn<T> {
  current: TermCardWithStats<T>;
  next: (result: ReviewResult) => void;
}

export interface FirebaseReviewedTerms {
  reviewedTerms: Record<string, ReviewResult>;
  lessonId: string;
}

function updateReviewResult(
  current: ReviewResult | undefined,
  correct: boolean
) {
  if (current === undefined) {
    // if no current
    // correct   --> ALL_CORRECT
    // incorrect --> SINGLE_MISTAKE
    return correct ? ReviewResult.ALL_CORRECT : ReviewResult.SINGLE_MISTAKE;
  } else if (correct) {
    // correct response doesn't change anything
    // ALL_CORRECT    --> ALL_CORRECT
    // SINGLE_MISTAKE --> SINGLE_MISTAKE
    // REPEAT_MISTAKE --> REPEAT_MISTAKE
    return current;
  } else {
    // incorrect response
    // ALL_CORRECT    --> SINGLE_MISTAKE
    // SINGLE_MISTAKE --> REPEAT_MISTAKE
    // REPEAT_MISTAKE --> REPEAT_MISTAKE
    return current === ReviewResult.ALL_CORRECT
      ? ReviewResult.SINGLE_MISTAKE
      : ReviewResult.REPEAT_MISTAKE;
  }
}

export function useReviewedTerms(lessonId: string): {
  reviewedTerms: Record<string, ReviewResult>;
  reviewTerm: (term: string, correct: boolean) => void;
} {
  const { user } = useAuth();
  const [firebaseReviewedTerms, setReviewedTerms] = useFirebaseReviewedTerms(
    user,
    lessonId
  );
  const reviewedTerms =
    (firebaseReviewedTerms.ready &&
      firebaseReviewedTerms.data?.reviewedTerms) ||
    {};

  return {
    reviewedTerms,
    reviewTerm(term: string, correct: boolean) {
      // there is sort of a race condition here where we could commit a result
      // with our dummy state `{}` and overwrite the database.
      setReviewedTerms({
        lessonId,
        reviewedTerms: {
          ...reviewedTerms,
          [term]: updateReviewResult(reviewedTerms[term], correct),
        },
      });
    },
  };
}

/**
 * Start a review session with the given cards.
 *
 * The cards must *already* be tracked by the provided leitner box instance.
 */
export function useReviewSession<T>(
  leitnerBoxes: LeitnerBoxState,
  lessonCards: Record<string, T>,
  lessonId: string,
  reviewTerm: (term: string, correct: boolean) => void
) {
  const termStats = useMemo(
    () =>
      Object.fromEntries(
        Object.keys(lessonCards).map((k) => [k, leitnerBoxes.terms[k]])
      ),
    [leitnerBoxes.terms, lessonCards]
  );

  const [storedPimsleurState, setStoredPimsleurState] =
    useLocalStorage<PimsleurTimingState | null>(
      `${lessonKey(lessonId)}/timings`,
      undefined,
      {
        raw: false,
        serializer: JSON.stringify,
        deserializer: JSON.parse,
      }
    );

  const timings = usePimsleurTimings(
    storedPimsleurState
      ? { type: "LOAD", state: storedPimsleurState }
      : { type: "NEW", terms: termStats }
  );

  useEffect(() => setStoredPimsleurState(timings.state), [timings.state]);

  const challengesRemaining = useMemo(
    () =>
      // count for terms that have been shown
      timings.state.sortedTerms.reduce(
        (count, stats) =>
          count + MAX_SHOW_PER_SESSION - stats.sessionRepetitions,
        0
      ) +
      // terms that haven't been shown
      Object.values(timings.state.termsToIntroduce).reduce(
        (count, stats) => count + showsPerSessionForBox(stats.box),
        0
      ),
    [timings.state.sortedTerms, timings.state.termsToIntroduce]
  );

  const currentCard: TermCardWithStats<T, TermStats> | undefined = useMemo(
    () =>
      timings.nextTerm
        ? {
            term: timings.nextTerm,
            stats: leitnerBoxes.terms[timings.nextTerm],
            card: lessonCards[timings.nextTerm],
          }
        : undefined,
    [timings.nextTerm, lessonCards]
  );

  const numTermsToIntroduce = Object.keys(
    timings.state.termsToIntroduce
  ).length;
  const numActiveTerms = timings.state.sortedTerms.length;
  const numFinishedTerms =
    Object.keys(timings.state.shownTerms).length - numActiveTerms;

  return {
    currentCard,
    challengesRemaining,
    numTermsToIntroduce,
    numActiveTerms,
    numFinishedTerms,
    reviewCurrentCard(correct: boolean) {
      if (currentCard) {
        reviewTerm(currentCard.term, correct);
        timings.markTermShown();
      }
    },
  };
}
