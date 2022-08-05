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

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const PIMSLEUR_TIMINGS = [
  5 * SECOND, // 0 - new
  30 * SECOND, // 1 - learning
  2 * MINUTE, // 2 - learning
  10 * MINUTE, // 3 - learning
  40 * MINUTE, // 4 - review at end of session
  2 * HOUR, // 5 - term learned
  18 * HOUR, // 6 - every other review session if twice a day
  1.5 * DAY, // 7 - every other day
  6 * DAY, // 8 - once a week
  28 * DAY, // 9 - once a month
];

/**
 * Add a bit of noise to timings so card order changes.
 * +/- 10%.
 */
function pimsleurNoise() {
  return Math.random() * 0.2 + 0.9;
}

function nextShowTime(lastShown: number, correctInARow: number) {
  return (
    lastShown +
    pimsleurNoise() *
      PIMSLEUR_TIMINGS[
        Math.min(Math.max(correctInARow, 0), PIMSLEUR_TIMINGS.length - 1)
      ]
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
