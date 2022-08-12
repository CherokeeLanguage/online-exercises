import { useMemo, useReducer } from "react";
import { SECOND, MINUTE } from "../utils/dateUtils";
import { PimsleurStats, TermStats } from "./types";

function repetitionOffsetForBox(box: number) {
  // discount at most 3 shows for well learned cards
  return Math.min(box, 3);
}

function newPimsleurStats(stats: TermStats): PimsleurStats {
  const repetitionOffset = repetitionOffsetForBox(stats.box);
  const now = Date.now();
  return {
    ...stats,
    lastShownTime: stats.lastShownDate,
    // show card at random time in 1st 5 minutes of session
    nextShowTime: now + 5 * MINUTE * Math.random(),
    sessionRepetitions: repetitionOffset,
  };
}

export interface PimsleurTimingState {
  terms: Record<string, PimsleurStats>;
  sortedTerms: PimsleurStats[];
  lastShown: string | undefined;
}

type PimsleurTimingAction = {
  type: "term_shown";
  term: string;
};

// shown 5x per session
const PIMSLEUR_TIMINGS = [
  5 * SECOND,
  25 * SECOND,
  2 * MINUTE,
  10 * MINUTE,
  50 * MINUTE,
];

export const MAX_SHOW_PER_SESSION = PIMSLEUR_TIMINGS.length;

export function showsPerSessionForBox(box: number) {
  return MAX_SHOW_PER_SESSION - repetitionOffsetForBox(box);
}

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

function updateTimings(timings: PimsleurStats): PimsleurStats {
  const now = Date.now();
  const newRepetitions = timings.sessionRepetitions + 1;
  return {
    ...timings,
    lastShownTime: now,
    nextShowTime: nextShowTime(now, newRepetitions),
    sessionRepetitions: newRepetitions,
  };
}

function compareTerms(term1: PimsleurStats, term2: PimsleurStats) {
  return term1.nextShowTime - term2.nextShowTime;
}

function reducePimsleurTimingState(
  state: PimsleurTimingState,
  action: PimsleurTimingAction
): PimsleurTimingState {
  switch (action.type) {
    case "term_shown":
      const newTerms = {
        ...state.terms,
        [action.term]: updateTimings(state.terms[action.term]),
      };
      return {
        terms: newTerms,
        sortedTerms: state.sortedTerms
          .map((s) => (s.key === action.term ? newTerms[action.term] : s))
          .filter((s) => s.sessionRepetitions < MAX_SHOW_PER_SESSION)
          .sort(compareTerms),
        lastShown: action.term,
      };
  }
}

function initializePimsleurTimingState(
  props: UsePimsleurTimingsProps
): PimsleurTimingState {
  if (props.type === "LOAD") return props.state;

  const termsWithTimings = Object.fromEntries(
    Object.entries(props.terms).map(([term, stats]) => [
      term,
      newPimsleurStats(stats),
    ])
  );

  return {
    terms: termsWithTimings,
    sortedTerms: Object.values(termsWithTimings).sort(compareTerms),
    lastShown: undefined,
  };
}

export type UsePimsleurTimingsProps =
  | {
      type: "NEW";
      terms: Record<string, TermStats>;
    }
  | {
      type: "LOAD";
      state: PimsleurTimingState;
    };

export function usePimsleurTimings(props: UsePimsleurTimingsProps) {
  const [state, dispatch] = useReducer(
    reducePimsleurTimingState,
    props,
    initializePimsleurTimingState
  );

  const nextTerm: PimsleurStats | undefined = useMemo(() => {
    const top = state.sortedTerms[0] as PimsleurStats | undefined;
    if (state.lastShown === top?.key && state.sortedTerms.length > 1)
      return state.sortedTerms[1];
    else return top;
  }, [state.lastShown, state.sortedTerms]);

  return {
    state,
    nextTerm,
    markTermShown() {
      if (nextTerm)
        dispatch({
          type: "term_shown",
          term: nextTerm.key,
        });
    },
  };
}
