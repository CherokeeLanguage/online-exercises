import { useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "react-use";
import { PimsleurStats, TermCardWithStats } from "./types";
import { ReviewResult, UseLeitnerBoxesReturn } from "./useLeitnerBoxes";
import { lessonKey } from "./LessonsProvider";
import {
  MAX_SHOW_PER_SESSION,
  PimsleurTimingState,
  usePimsleurTimings,
} from "./usePimsleurTimings";

export interface UseLeitnerReviewSessionReturn<T> {
  current: TermCardWithStats<T>;
  next: (result: ReviewResult) => void;
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

/**
 * Start a review session with the given cards.
 *
 * The cards must *already* be tracked by the provided leitner box instance.
 */
export function useReviewSession<T>(
  leitnerBoxes: UseLeitnerBoxesReturn,
  lessonCards: Record<string, T>,
  lessonId: string
) {
  const termStats = useMemo(
    () =>
      Object.fromEntries(
        Object.keys(lessonCards).map((k) => [k, leitnerBoxes.state.terms[k]])
      ),
    [leitnerBoxes.state.terms, lessonCards]
  );

  const [storedReviewedTerms, setReviewedTerms] = useLocalStorage<
    Record<string, ReviewResult>
  >(`${lessonKey(lessonId)}/reviewed-terms`, undefined, {
    raw: false,
    serializer: JSON.stringify,
    deserializer: JSON.parse,
  });
  const reviewedTerms = storedReviewedTerms ?? {};

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
      timings.state.sortedTerms.reduce(
        (count, stats) =>
          count + MAX_SHOW_PER_SESSION - stats.sessionRepetitions,
        0
      ),
    [timings.state.sortedTerms]
  );

  const currentCard: TermCardWithStats<T, PimsleurStats> | undefined = useMemo(
    () =>
      timings.nextTerm && {
        term: timings.nextTerm.key,
        stats: timings.nextTerm,
        card: lessonCards[timings.nextTerm.key],
      },
    [timings.nextTerm, lessonCards]
  );

  return {
    currentCard,
    reviewedTerms,
    challengesRemaining,
    reviewCurrentCard(correct: boolean) {
      if (currentCard) {
        setReviewedTerms({
          ...reviewedTerms,
          [currentCard.term]: updateReviewResult(
            reviewedTerms[currentCard.term],
            correct
          ),
        });
        timings.markTermShown();
      }
    },
  };
}
