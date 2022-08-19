import { useEffect, useMemo } from "react";
import { useLocalStorage } from "react-use";
import { TermCardWithStats, TermStats } from "./types";
import { LeitnerBoxState, ReviewResult } from "../state/reducers/leitnerBoxes";
import { lessonKey } from "../state/reducers/lessons";
import {
  MAX_SHOW_PER_SESSION,
  PimsleurTimingState,
  showsPerSessionForBox,
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

export function useReviewedTerms(lessonId: string) {
  const [storedReviewedTerms, setReviewedTerms] = useLocalStorage<
    Record<string, ReviewResult>
  >(`${lessonKey(lessonId)}/reviewed-terms`, undefined, {
    raw: false,
    serializer: JSON.stringify,
    deserializer: JSON.parse,
  });
  const reviewedTerms = storedReviewedTerms ?? {};

  return {
    reviewedTerms,
    reviewTerm(term: string, correct: boolean) {
      setReviewedTerms({
        ...reviewedTerms,
        [term]: updateReviewResult(reviewedTerms[term], correct),
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
