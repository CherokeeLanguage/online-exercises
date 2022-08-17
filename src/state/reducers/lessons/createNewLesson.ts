import { Lesson } from ".";
import { VocabSet, collections } from "../../../data/vocabSets";
import { termNeedsPractice } from "../../../spaced-repetition/groupTermsIntoLessons";
import { TermStats } from "../../../spaced-repetition/types";
import { showsPerSessionForBox } from "../../../spaced-repetition/usePimsleurTimings";
import { getToday } from "../../../utils/dateUtils";
import { Act, StateWithThen } from "../../../utils/useReducerWithImperative";
import { UserStateAction } from "../../actions";
import { UserState } from "../../UserStateProvider";

/**
 * Scan a list and perform takeWhile on the scan results.
 * @param list List to scan + takeWhile
 * @param reducer Scaning function
 * @param predicate Return false to stop scanning
 * @param initialValue Initial value for scan function
 * @returns
 */
export function scanWhile<A, T>(
  list: T[],
  reducer: (accumulator: A, item: T) => A,
  predicate: (accumulator: A, item: T) => boolean,
  initialValue: A
): [T[], A] {
  let accumulatedValue = initialValue;

  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    const newAccumulatedValue = reducer(accumulatedValue, item);

    if (!predicate(newAccumulatedValue, item))
      // we return the old accumulated value, not including the current item's impact
      return [list.slice(0, i), accumulatedValue];

    accumulatedValue = newAccumulatedValue;
  }

  return [list, accumulatedValue];
}

export function pullNewSets(
  state: UserState,
  numNewTermsNeeded: number
): VocabSet[] {
  if (state.upstreamCollection === undefined)
    throw new Error(
      "Out of terms! Add new terms or add an upstream collection"
    );
  const collection = collections[state.upstreamCollection];
  const remainingSetsInCollection = collection.sets.filter(
    (set) => !(set.id in state.sets)
  );

  const [setsToAdd, termsAdded] = scanWhile(
    remainingSetsInCollection,
    (termsAdded, set) => termsAdded + set.terms.length,
    (termsAdded) => termsAdded <= numNewTermsNeeded,
    0
  );

  if (termsAdded < numNewTermsNeeded)
    throw new Error("Not enough terms in upstream set to create a lesson");

  return setsToAdd;
}

function fetchNewTermsIfNeeded(
  state: UserState,
  act: Act<UserState, UserStateAction>,
  numNewTermsToInclude: number
) {
  const [_, potentialNewTerms] = splitNewTerms(state);
  return potentialNewTerms.length < numNewTermsToInclude
    ? act(
        ...pullNewSets(
          state,
          numNewTermsToInclude - potentialNewTerms.length
        ).map((set) => ({
          type: "ADD_SET" as const,
          setToAdd: set.id,
        }))
      )
    : act();
}

/**
 * Split up new are review terms
 */
function splitNewTerms(state: UserState) {
  const today = getToday();
  const termsToPracticeToday = Object.values(state.leitnerBoxes.terms).filter(
    (term) => termNeedsPractice(term, today)
  );
  return termsToPracticeToday.reduce<[TermStats[], TermStats[]]>(
    ([reviewTerms, newTerms], term) =>
      // new terms have never been shown
      term.lastShownDate === 0
        ? [reviewTerms, [...newTerms, term]]
        : [[...reviewTerms, term], newTerms],
    [[], []]
  );
}

/**
 * Creates a lesson with approximately the numChallenges requested.
 *
 * Acts as a single dispatch against the global user state reducer.
 *
 * See `dispatchImperativeBlock`.
 * @param numChallenges
 * @param state
 * @param act
 * @returns
 */
export function createLessonTransaction(
  desiredId: string,
  numChallenges: number,
  reviewOnly: boolean,
  state: UserState,
  act: Act<UserState, UserStateAction>
): StateWithThen<UserState, UserStateAction> {
  // if the lesson was already created, don't make it again
  if (desiredId in state.lessons) return act();

  // 10 terms for 15 minute lesson
  // TODO: finetune this
  const numNewTermsToInclude = reviewOnly ? 0 : Math.floor(numChallenges / 12);

  return fetchNewTermsIfNeeded(state, act, numNewTermsToInclude).then(
    (state, act) => {
      // split terms into review terms and new terms
      const [potentialReviewTerms, potentialNewTerms] = splitNewTerms(state);

      const newTerms = potentialNewTerms.slice(0, numNewTermsToInclude);

      // new terms are in box 0, by definition
      const numNewTermChallenges = newTerms.length * showsPerSessionForBox(0);
      const numReviewTermChallenges = numChallenges - numNewTermChallenges;

      // select review terms until we max number of challenges
      const [reviewTerms, reviewChallengesFound] = scanWhile(
        potentialReviewTerms,
        (count, term) => count + showsPerSessionForBox(term.box),
        (count) => count <= numReviewTermChallenges,
        0
      );

      if (reviewChallengesFound + numNewTermChallenges < 0.8 * numChallenges) {
        // TODO: recurse and increase new term count
        console.log("Not enough review terms for a lesson! oops");
      }

      const lesson: Lesson = {
        id: desiredId,
        terms: [...newTerms, ...reviewTerms].map((t) => t.key),
        startedAt: null,
        completedAt: null,
        createdAt: Date.now(),
        createdFor: getToday(),
        type: "DAILY",
      };

      return act({
        type: "ADD_LESSON",
        lesson,
      });
    }
  );
}
