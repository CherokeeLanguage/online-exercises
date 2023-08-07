import { Lesson } from ".";
import { collections } from "../../../data/vocabSets";
import { TermStats } from "../../../spaced-repetition/types";
import { showsPerSessionForBox } from "../../../spaced-repetition/usePimsleurTimings";
import { DAY, getToday } from "../../../utils/dateUtils";
import { UserState } from "../../useUserState";

export function termNeedsPractice(
  term: TermStats | undefined,
  today: number
): boolean {
  // needs practice if never reviewed
  if (!term) return true;
  // term needs practice if next show date is before tomorrow
  else return term.nextShowDate < today + DAY;
}

/**
 * Scan a list and perform takeWhile on the scan results.
 *
 * Scanning happens _after_ predicate is called. Ie. the predicate receives the
 * value of the accumulator _without_ the item reduced.
 *
 * @param list List to scan + takeWhile
 * @param reducer Scaning function
 * @param predicate Return false to stop scanning
 * @param initialValue Initial value for scan function
 * @returns
 */
export function scanWhile<A, T>(
  list: T[],
  reducer: (accumulator: A, item: T) => A,
  predicate: (accumulatorWithoutItem: A, item: T) => boolean,
  initialValue: A
): [T[], A] {
  let accumulatedValue = initialValue;

  for (let i = 0; i < list.length; i++) {
    const item = list[i];

    if (!predicate(accumulatedValue, item))
      // we return the old accumulated value, not including the current item's impact
      return [list.slice(0, i), accumulatedValue];

    accumulatedValue = reducer(accumulatedValue, item);
  }

  return [list, accumulatedValue];
}

export interface LessonPlan {
  lesson: Omit<Lesson, "id"> & { content: "ALL_NEW" | "ALL_REVIEW" | "MIXED" };
  setsToAdd: string[];
}

/**
 * Plan a lesson with the desired number of challenges. Will attempt to satisfy
 * `desiredNewRate` but may add more or fewer new terms.
 * @param state
 * @param desiredChallenges
 * @param desiredNewRate
 * @returns
 */
export function planLesson(
  state: UserState,
  // total number of questions for session
  desiredChallenges: number,
  // % of challenges that should be new terms
  desiredNewRate: number
): LessonPlan {
  const today = getToday();
  const reviewTerms = Object.values(state.leitnerBoxes.terms).filter((t) =>
    termNeedsPractice(t, today)
  );

  // how many new terms do we want?
  const newTermsRequested = Math.floor(
    (desiredNewRate * desiredChallenges) / showsPerSessionForBox(0)
  );

  // how much review does that mean?
  const reviewChallengesNeeded =
    desiredChallenges - newTermsRequested * showsPerSessionForBox(0);

  // how much review is available
  const numReviewChallengesAvailable = reviewTerms.reduce(
    (tot, term) => tot + showsPerSessionForBox(term.box),
    0
  );

  // adjust number of new terms if we didn't find enough review terms
  const newTermsNeeded =
    numReviewChallengesAvailable >= reviewChallengesNeeded
      ? newTermsRequested
      : Math.ceil(
          (desiredChallenges - numReviewChallengesAvailable) /
            showsPerSessionForBox(0)
        );

  // try to find that many new terms, pulling from the user's upstream set
  const { newTerms, setsToAdd } = getNewTerms(state, newTermsNeeded);

  // adjust number of review challenges if we didn't find enough new terms
  const numReviewChallengesForLesson =
    newTerms.length >= newTermsNeeded
      ? reviewChallengesNeeded
      : desiredChallenges - newTerms.length * showsPerSessionForBox(0);

  const [selectedReviewTerms, reviewChallengesSelected] = scanWhile(
    reviewTerms,
    (reviewChallenges, term) =>
      reviewChallenges + showsPerSessionForBox(term.box),
    (reviewChallenges) => reviewChallenges < numReviewChallengesForLesson,
    0
  );

  const realNumChallenges =
    newTerms.length * showsPerSessionForBox(0) + reviewChallengesSelected;

  return {
    setsToAdd,
    lesson: {
      type: "DAILY",
      content:
        reviewChallengesSelected === 0
          ? "ALL_NEW"
          : newTerms.length === 0
          ? "ALL_REVIEW"
          : "MIXED",
      createdAt: Date.now(),
      createdFor: getToday(),
      terms: [...newTerms, ...selectedReviewTerms.map((t) => t.key)],
      numChallenges: realNumChallenges,
      startedAt: null,
      completedAt: null,
    },
  };
}

/**
 * Find new terms for a lesson. Also returns a list of new sets that needed to
 * be added to find enough terms.
 */
function getNewTerms(
  state: UserState,
  newTermsNeeded: number
): { newTerms: string[]; setsToAdd: string[] } {
  // terms that are added but have never been seen
  const newTermsAlreadyAdded = Object.values(state.leitnerBoxes.terms)
    .filter((t) => t.lastShownDate === 0)
    .map((t) => t.key);

  if (newTermsAlreadyAdded.length >= newTermsNeeded)
    return {
      newTerms: newTermsAlreadyAdded.slice(0, newTermsNeeded),
      setsToAdd: [],
    };

  const termsToAdd = newTermsNeeded - newTermsAlreadyAdded.length;

  if (!state.config.upstreamCollection)
    return {
      newTerms: newTermsAlreadyAdded.slice(0, newTermsNeeded),
      setsToAdd: [],
    };

  const upstreamCollection = collections[state.config.upstreamCollection];

  const [setsAdded, _termsAdded] = scanWhile(
    upstreamCollection.sets.filter(
      (s) => state.config.sets[s.id] === undefined
    ),
    (termsAdded, set) =>
      termsAdded +
      set.terms.filter((t) => state.leitnerBoxes.terms[t] === undefined).length,
    (termsAdded) => termsAdded < termsToAdd,
    0
  );

  const termsFromAddedSets = setsAdded.flatMap((s) => s.terms);
  const allNewTerms = [...newTermsAlreadyAdded, ...termsFromAddedSets];

  return {
    newTerms: allNewTerms.slice(0, newTermsNeeded),
    setsToAdd: setsAdded.map((s) => s.id),
  };
}
