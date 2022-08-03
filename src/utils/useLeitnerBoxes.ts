import { Reducer, useMemo, useReducer, useState } from "react";

interface NewUseLeitnerBoxesProps {
  type: "NEW";
  numBoxes: number;
  initialTerms: string[];
}

interface LoadUseLeitnerBoxProps {
  type: "LOAD";
  state: LeitnerBoxState;
}

export type UseLeitnerBoxesProps =
  | NewUseLeitnerBoxesProps
  | LoadUseLeitnerBoxProps;

export interface UseLeitnerBoxesReturn {
  state: LeitnerBoxState;
  reviewTerm: (termKey: string, termCorrect: boolean) => void;
  addNewTerms: (terms: string[]) => void;
}

export interface TermStats {
  key: string;
  box: number;
  // timestamps
  lastShown: number;
  nextShowTime: number;
}

export interface LeitnerBoxState {
  /**
   * Terms with box info.
   */
  terms: Record<string, TermStats>;
  numBoxes: number;
}

type ReviewCardAction = {
  type: "review_term";
  correct: boolean; // was previous card answered correctly?
  termKey: string; // key of the term that was reviewed
};

type AddNewTermsAction = {
  type: "add_new_terms";
  terms: string[];
};

type LeitnerBoxAction = ReviewCardAction | AddNewTermsAction;

const PIMSLEUR_TIMINGS = new Array(15)
  .fill(undefined)
  .map((_, idx) => Math.pow(5, idx));

function nextShowTime(lastShown: number, correctInARow: number) {
  return (
    lastShown +
    (1 +
      PIMSLEUR_TIMINGS[
        Math.min(Math.max(correctInARow, 0), PIMSLEUR_TIMINGS.length - 1)
      ]) *
      1000
  );
}

export function newTerm(term: string): TermStats {
  return {
    key: term,
    box: 0,
    lastShown: 0,
    nextShowTime: 0,
  };
}

function reduceLeitnerBoxState(
  { terms, numBoxes }: LeitnerBoxState,
  action: LeitnerBoxAction
): LeitnerBoxState {
  switch (action.type) {
    case "review_term":
      const term = terms[action.termKey];
      const now = Date.now();
      if (!term) {
        return {
          terms: {
            ...terms,
            [action.termKey]: {
              key: action.termKey,
              box: 0,
              lastShown: now,
              nextShowTime: nextShowTime(now, 0),
            },
          },
          numBoxes,
        };
      }

      const newBox = action.correct ? Math.min(term.box + 1, numBoxes - 1) : 0;
      return {
        terms: {
          ...terms,
          [action.termKey]: {
            ...term,
            box: newBox,
            lastShown: now,
            nextShowTime: nextShowTime(now, newBox),
          },
        },
        numBoxes,
      };
    case "add_new_terms":
      return {
        terms: {
          ...Object.fromEntries(
            action.terms.map((term) => [term, newTerm(term)])
          ),
          ...terms,
        },
        numBoxes,
      };
  }
}

function initLeiterBoxState({
  initialTerms,
  numBoxes,
}: {
  initialTerms: string[];
  numBoxes: number;
}): LeitnerBoxState {
  return {
    terms: Object.fromEntries(
      initialTerms.map((term) => [term, newTerm(term)])
    ),
    numBoxes,
  };
}

export function useLeitnerBoxes(
  props: UseLeitnerBoxesProps
): UseLeitnerBoxesReturn {
  const [state, dispatch] = useReducer<
    Reducer<LeitnerBoxState, LeitnerBoxAction>
  >(
    reduceLeitnerBoxState,
    props.type === "NEW" ? initLeiterBoxState(props) : props.state
  );

  return {
    state,
    reviewTerm(termKey, correct) {
      dispatch({
        type: "review_term",
        correct,
        termKey,
      });
    },
    addNewTerms(terms) {
      dispatch({
        type: "add_new_terms",
        terms,
      });
    },
  };
}
