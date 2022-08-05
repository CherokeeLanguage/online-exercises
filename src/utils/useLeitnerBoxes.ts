import { Reducer, useReducer } from "react";

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
  resize: (numBoxes: number) => void;
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

type ResizeAction = {
  type: "resize";
  newNumBoxes: number;
};

type LeitnerBoxAction = ReviewCardAction | ResizeAction;

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
    resize(newNumBoxes) {
      dispatch({
        type: "resize",
        newNumBoxes,
      });
    },
  };
}
