import { DateTime, DurationLike } from "luxon";
import { Dispatch, Reducer, useMemo, useReducer } from "react";
import { getToday } from "../../utils/dateUtils";
import { TermStats } from "../../spaced-repetition/types";
import { ImperativeBlock } from "../../utils/useReducerWithImperative";
import { UserState, UserStateAction } from "../UserStateProvider";

interface NewUseLeitnerBoxesProps {
  type: "NEW";
  numBoxes: number;
}

interface LoadUseLeitnerBoxProps {
  type: "LOAD";
  state: LeitnerBoxState;
}

export type UseLeitnerBoxesProps =
  | NewUseLeitnerBoxesProps
  | LoadUseLeitnerBoxProps;

export interface LeitnerBoxState {
  /**
   * Terms with box info.
   */
  terms: Record<string, TermStats>;
  numBoxes: number;
}

export enum ReviewResult {
  REPEAT_MISTAKE = "REPEAT_MISTAKE",
  SINGLE_MISTAKE = "SINGLE_MISTAKE",
  ALL_CORRECT = "ALL_CORRECT",
}

type ConcludeReviewSessionAction = {
  type: "conclude_review";
  reviewedTerms: Record<string, ReviewResult>;
};

type AddNewTermsAction = {
  type: "add_new_terms";
  newTerms: string[];
};

type RemoveTermsAction = {
  type: "remove_terms";
  termsToRemove: string[];
};

type ResizeAction = {
  type: "resize";
  newNumBoxes: number;
};

export type LeitnerBoxAction =
  | ConcludeReviewSessionAction
  | AddNewTermsAction
  | RemoveTermsAction
  | ResizeAction;

// TODO:
// leitner boxes between sessions
// if answered correctly all times in session --> advance
// if answered incorrectly during session --> demote (each time or only once??)
// leiter box timings on the order of days/weeks
// pimsleur timings still just seconds or whatever

const LEITNER_TIMINGS: DurationLike[] = [
  { days: 0 }, // review again today
  { days: 1 }, // tomorrow
  { days: 3 }, // three days
  { weeks: 1 }, // week
  { weeks: 2 }, // two weeks
  { months: 1 }, // month
];

function nextShowDate(lastShownDate: number, box: number): number {
  return DateTime.fromMillis(lastShownDate)
    .plus(
      LEITNER_TIMINGS[Math.min(Math.max(box, 0), LEITNER_TIMINGS.length - 1)]
    )
    .toMillis();
}

function newTermStats(term: string, today: number): TermStats {
  return {
    key: term,
    box: 0,
    // show immediately
    lastShownDate: 0,
    nextShowDate: nextShowDate(today, 0),
  };
}

function updateBox(box: number, result: ReviewResult, numBoxes: number) {
  switch (result) {
    case ReviewResult.ALL_CORRECT:
      return Math.min(box + 1, numBoxes - 1);
    case ReviewResult.SINGLE_MISTAKE:
      return box;
    case ReviewResult.REPEAT_MISTAKE:
      return Math.max(box - 1, 0);
  }
}

function updateTermStats(
  stats: TermStats,
  result: ReviewResult,
  numBoxes: number,
  today: number
): TermStats {
  const newBox = updateBox(stats.box, result, numBoxes);

  return {
    ...stats,
    box: newBox,
    lastShownDate: today,
    nextShowDate: nextShowDate(today, newBox),
  };
}

export function reduceLeitnerBoxState(
  { terms, numBoxes }: LeitnerBoxState,
  action: LeitnerBoxAction
): LeitnerBoxState {
  const today = getToday();
  switch (action.type) {
    case "add_new_terms":
      return {
        terms: action.newTerms.reduce(
          // do not overwrite existing data
          (newTerms, term) => ({
            [term]: newTermStats(term, today),
            ...newTerms,
          }),
          terms
        ),
        numBoxes,
      };
    case "conclude_review":
      return {
        terms: Object.entries(action.reviewedTerms).reduce(
          (newTerms, [term, result]) => ({
            ...newTerms,
            [term]: updateTermStats(terms[term], result, numBoxes, today),
          }),
          terms
        ),
        numBoxes,
      };
    case "remove_terms":
      return {
        terms: Object.fromEntries(
          Object.entries(terms).filter(
            ([key, _]) => key in action.termsToRemove
          )
        ),
        numBoxes,
      };
    case "resize":
      return {
        terms: Object.fromEntries(
          Object.entries(terms).map(([term, stats]) => [
            term,
            { ...stats, box: Math.min(stats.box, action.newNumBoxes - 1) },
          ])
        ),
        numBoxes: action.newNumBoxes,
      };
  }
}

export interface LeitnerBoxesInteractors {
  resize: (numBoxes: number) => void;
}

/**
 * Track a set of terms as they are learned using the Leitner Box system.
 *
 * This system is used to track how cards are being learned at a high level, and
 * deciding which cards are reviewed on a given day.
 *
 * To track when cards should be shown in an actual review session, use `usePimsleurTimings`.
 */
export function useLeitnerBoxesInteractors(
  state: UserState,
  dispatch: Dispatch<UserStateAction>,
  dispatchImperativeBlock: Dispatch<ImperativeBlock<UserState, UserStateAction>>
): LeitnerBoxesInteractors {
  return useMemo(
    () => ({
      resize(newNumBoxes) {
        dispatch({
          slice: "LeitnerBoxes",
          action: {
            type: "resize",
            newNumBoxes,
          },
        });
      },
    }),
    [dispatch]
  );
}
