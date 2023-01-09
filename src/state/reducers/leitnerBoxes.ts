import { DateTime, DurationLike } from "luxon";
import { Dispatch, Reducer, useMemo, useReducer } from "react";
import { getToday } from "../../utils/dateUtils";
import { TermStats } from "../../spaced-repetition/types";
import { ImperativeBlock } from "../../utils/useReducerWithImperative";
import { UserState } from "../UserStateProvider";
import { vocabSets } from "../../data/vocabSets";
import { UserStateAction } from "../actions";
import { migrateTerm } from "../../data/migrations";

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

function addNewTermsIfMissing(
  terms: Record<string, TermStats>,
  newTerms: string[],
  today: number
): Record<string, TermStats> {
  // filter out terms that already exist
  const termsToAdd = newTerms.filter((t) => !(t in terms));
  return {
    ...terms,
    // need to add terms down here so they are in the right order
    ...Object.fromEntries(
      termsToAdd.map((term) => [term, newTermStats(term, today)])
    ),
  };
}

export function reduceLeitnerBoxState(
  { leitnerBoxes: { terms, numBoxes }, ...globalState }: UserState,
  action: UserStateAction
): LeitnerBoxState {
  const today = getToday();
  switch (action.type) {
    case "ADD_SET":
      const newTerms = vocabSets[action.setToAdd].terms;
      return {
        terms: addNewTermsIfMissing(terms, newTerms, today),
        numBoxes,
      };
    case "CONCLUDE_LESSON":
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
    case "REMOVE_SET":
      const setToRemove = vocabSets[action.setToRemove];
      // we need to figure out which terms are used ONLY by the set we are removing
      // to do this, we remove any terms which appear in another set
      const termsUniqueToSet = Object.values(globalState.sets)
        // get all other sets
        .filter((stats) => stats.setId !== setToRemove.id)
        // get terms for those sets
        .map((s) => vocabSets[s.setId].terms)
        // for each set of terms, remove all terms from the list of unique terms
        .reduce(
          (uniqueTerms, setTerms) =>
            // for each term in that set
            setTerms.reduce(
              // drop that term from the list of unique terms, if it is in there
              (uniqueTerms, potentialDuplicateTerm) =>
                uniqueTerms.filter((term) => term !== potentialDuplicateTerm),
              uniqueTerms
            ),
          setToRemove.terms // list of unique terms starts with all terms in set to delete
        );

      return {
        terms: Object.fromEntries(
          Object.entries(terms).filter(
            ([key, _]) => !termsUniqueToSet.includes(key)
          )
        ),
        numBoxes,
      };
    case "RESIZE_LEITNER_BOXES":
      return {
        terms: Object.fromEntries(
          Object.entries(terms).map(([term, stats]) => [
            term,
            { ...stats, box: Math.min(stats.box, action.newNumBoxes - 1) },
          ])
        ),
        numBoxes: action.newNumBoxes,
      };
    case "HANDLE_SET_CHANGES":
      const termsFromAllSets = Object.keys(globalState.sets).flatMap(
        (setId) => vocabSets[setId].terms
      );
      const termsWithMigrations = Object.fromEntries(
        Object.entries(terms).map(([term, stats]) => {
          const newTerm = migrateTerm(term);
          return [newTerm, { ...stats, key: newTerm }];
        })
      );
      return {
        terms: addNewTermsIfMissing(
          termsWithMigrations,
          termsFromAllSets,
          today
        ),
        numBoxes,
      };
  }

  return { terms, numBoxes };
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
          type: "RESIZE_LEITNER_BOXES",
          newNumBoxes,
        });
      },
    }),
    [dispatch]
  );
}
