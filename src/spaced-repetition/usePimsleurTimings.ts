import { useMemo, useReducer } from "react";
import { SECOND, MINUTE } from "../utils/dateUtils";
import { PimsleurStats, TermStats } from "./types";

function repetitionOffsetForBox(box: number) {
  // discount at most 3 shows for well learned cards
  return Math.min(box, 3);
}

function newPimsleurStats(stats: TermStats, now: number): PimsleurStats {
  // cards that the user knows well skip the first few shows
  const repetitionOffset = repetitionOffsetForBox(stats.box);
  return {
    ...stats,
    lastShownTime: now,
    nextShowTime: nextShowTime(now, repetitionOffset),
    sessionRepetitions: repetitionOffset,
  };
}

export interface PimsleurTimingState {
  shownTerms: Record<string, PimsleurStats>;
  termsToIntroduce: Record<string, TermStats>;
  sortedTerms: PimsleurStats[];
  lastShown: string | undefined;
}

type PimsleurTimingAction = {
  type: "term_shown";
  term: string;
};

// shown 4x per session
const PIMSLEUR_TIMINGS = [5 * SECOND, 25 * SECOND, 2 * MINUTE, 10 * MINUTE];

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
      if (action.term in state.shownTerms) {
        const newShownTerms = {
          ...state.shownTerms,
          [action.term]: updateTimings(state.shownTerms[action.term]),
        };
        return {
          shownTerms: newShownTerms,
          sortedTerms: state.sortedTerms
            .map((s) =>
              s.key === action.term ? newShownTerms[action.term] : s
            )
            .filter((s) => s.sessionRepetitions < MAX_SHOW_PER_SESSION)
            .sort(compareTerms),
          termsToIntroduce: state.termsToIntroduce,
          lastShown: action.term,
        };
      } else {
        // we always call update timings
        const newTermStats = updateTimings(
          newPimsleurStats(state.termsToIntroduce[action.term], Date.now())
        );
        const newShownTerms = {
          ...state.shownTerms,
          [action.term]: newTermStats,
        };

        return {
          shownTerms: newShownTerms,
          sortedTerms: [...state.sortedTerms, newTermStats]
            .filter((s) => s.sessionRepetitions < MAX_SHOW_PER_SESSION)
            .sort(compareTerms),
          termsToIntroduce:
            action.term in state.termsToIntroduce
              ? Object.fromEntries(
                  Object.entries(state.termsToIntroduce).filter(
                    ([term, _]) => term !== action.term
                  )
                )
              : state.termsToIntroduce,
          lastShown: action.term,
        };
      }
  }
}

function initializePimsleurTimingState(
  props: UsePimsleurTimingsProps
): PimsleurTimingState {
  if (props.type === "LOAD") return props.state;

  return {
    shownTerms: {},
    sortedTerms: [],
    termsToIntroduce: props.terms,
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

  const nextTerm: string | undefined = useMemo(() => {
    const now = Date.now();

    // keep track of next new term to show
    const nextNewTerm = Object.keys(state.termsToIntroduce)[0] as
      | string
      | undefined;

    // never show the same card twice in a row
    let topCard = state.sortedTerms[0] as PimsleurStats | undefined;
    if (topCard?.key === state.lastShown && state.sortedTerms.length > 1) {
      topCard = state.sortedTerms[1];
    }

    // if no top card, show a new card or we are out of cards
    if (!topCard) {
      console.log("Showing new term because there is no top card");
      return nextNewTerm;
    }

    // if it's time to show the card, then show it
    if (topCard.nextShowTime <= now) {
      console.log(
        `Top card is ready to show (${
          (now - topCard.nextShowTime) / 1000
        } secs)`
      );
      return topCard.key;
    }

    // if there is a new term, show it
    if (nextNewTerm) {
      console.log(
        `Showing new term because top card is too early ${
          (topCard.nextShowTime - now) / 1000
        }`
      );
      return nextNewTerm;
    }
    // otherwise, show top card early
    else {
      console.log(
        `Showing top card early because there are no more new terms ${
          (topCard.nextShowTime - now) / 1000
        }`
      );
      return topCard.key;
    }
  }, [state.lastShown, state.sortedTerms]);

  return {
    state,
    nextTerm,
    markTermShown() {
      if (nextTerm)
        dispatch({
          type: "term_shown",
          term: nextTerm,
        });
    },
  };
}
