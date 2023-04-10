import { Lesson } from ".";
import { VocabSet, collections } from "../../../data/vocabSets";
import { TermStats } from "../../../spaced-repetition/types";
import { showsPerSessionForBox } from "../../../spaced-repetition/usePimsleurTimings";
import { DAY, getToday } from "../../../utils/dateUtils";
import { UserState } from "../../useUserState";

export type Result<T, E> =
  | { type: "SUCCESS"; result: T }
  | { type: "ERROR"; error: E };

export type CreateLessonResult = Result<
  {
    setsToAdd: string[]; // new sets that have terms used in the lesson
    lesson: Lesson;
  },
  LessonCreationErrorType
>;

export enum LessonCreationErrorType {
  "NOT_ENOUGH_TERMS_FOR_REVIEW_LESSON",
  "NOT_ENOUGH_NEW_TERMS_FOR_LESSON",
}

export interface LessonCreationError {
  lessonId: string;
  type: LessonCreationErrorType;
}

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

export function pullNewSets(
  state: UserState,
  numNewTermsNeeded: number
): [VocabSet[], string[], number] {
  if (state.config.upstreamCollection === null)
    throw new Error(
      "No upstream collection. This should have been checked before calling."
    );
  const collection = collections[state.config.upstreamCollection];
  const remainingSetsInCollection = collection.sets.filter(
    (set) => !(set.id in state.config.sets)
  );

  const [setsToAdd, { termsFound, count }] = scanWhile<
    {
      termsFound: string[];
      count: number;
    },
    VocabSet
  >(
    remainingSetsInCollection,
    ({ termsFound, count }, set) => ({
      count: count + set.terms.length,
      termsFound: [...termsFound, ...set.terms],
    }),
    ({ count }) => count <= numNewTermsNeeded,
    { termsFound: [], count: 0 }
  );

  return [setsToAdd, termsFound, count];
}

function findNewTermsIfNeeded(
  numNewTermsToInclude: number,
  state: UserState
): Result<
  { setsToAdd: VocabSet[]; termsFound: string[] },
  LessonCreationErrorType.NOT_ENOUGH_NEW_TERMS_FOR_LESSON
> {
  const [_, potentialNewTerms] = splitNewTerms(state);

  // we have enough terms
  if (potentialNewTerms.length >= numNewTermsToInclude)
    return {
      type: "SUCCESS",
      result: { setsToAdd: [], termsFound: [] },
    };

  // we don't have enough terms AND there's nowhere to get more
  if (state.config.upstreamCollection === undefined)
    return {
      type: "ERROR",
      error: LessonCreationErrorType.NOT_ENOUGH_NEW_TERMS_FOR_LESSON,
    };

  const numTermsToFind = numNewTermsToInclude - potentialNewTerms.length;

  const [setsToAdd, termsFound, numTermsFound] = pullNewSets(
    state,
    numTermsToFind
  );

  if (numTermsFound < numTermsToFind)
    return {
      type: "ERROR",
      error: LessonCreationErrorType.NOT_ENOUGH_NEW_TERMS_FOR_LESSON,
    };

  return {
    type: "SUCCESS",
    result: { setsToAdd, termsFound },
  };
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
 * Create a lesson, possibly using new terms that will need to be added for the user.
 */
export function createLessonAndFindSetsToAdd(
  desiredId: string,
  desiredNumChallenges: number,
  reviewOnly: boolean,
  state: UserState,
  suggestedNewTermsToInclude?: number
): CreateLessonResult {
  // // if the lesson was already created, don't make it again
  // if (desiredId in state.lessons) return act();

  // 10 terms for 15 minute lesson
  // TODO: finetune this
  // this may change if not enough review terms are available
  const numNewTermsToInclude =
    suggestedNewTermsToInclude ??
    (reviewOnly ? 0 : Math.floor(desiredNumChallenges / 12));

  const minChallenges = reviewOnly
    ? 0.5 * desiredNumChallenges // review only lessons can be shorter (so your last reivew lesson can be completed more often)
    : 0.85 * desiredNumChallenges; // lessons with new terms should always be about full length

  const newTermsResult = findNewTermsIfNeeded(numNewTermsToInclude, state);

  if (newTermsResult.type === "ERROR") return newTermsResult;
  const {
    result: { setsToAdd, termsFound: newTermsFromSetsToAdd },
  } = newTermsResult;

  // split terms into review terms and new terms
  const [potentialReviewTerms, newTermsAlreadyAdded] = splitNewTerms(state);

  const potentialNewTerms = [
    ...newTermsAlreadyAdded.map((t) => t.key),
    ...newTermsFromSetsToAdd,
  ];

  // new terms are in box 0, by definition
  const numNewTermChallenges = numNewTermsToInclude * showsPerSessionForBox(0);
  const numReviewTermChallenges = desiredNumChallenges - numNewTermChallenges;

  // select review terms until we max number of challenges
  const [reviewTerms, reviewChallengesFound] = scanWhile(
    potentialReviewTerms,
    (count, term) => count + showsPerSessionForBox(term.box),
    (count) => count <= numReviewTermChallenges,
    0
  );

  // if there aren't enough terms...
  if (reviewChallengesFound + numNewTermChallenges < minChallenges) {
    if (reviewOnly) {
      console.log(
        "Not enough review terms for a lesson! But a review only lesson was requested!"
      );
      return {
        type: "ERROR",
        error: LessonCreationErrorType.NOT_ENOUGH_TERMS_FOR_REVIEW_LESSON,
      };
    } else {
      // try to fill lesson with new terms
      return createLessonAndFindSetsToAdd(
        desiredId,
        desiredNumChallenges,
        reviewOnly,
        state,
        Math.floor(
          // remaining challenges / challenges per new term
          (desiredNumChallenges - reviewChallengesFound) /
            showsPerSessionForBox(0)
        )
      );
    }
  }

  // if we have enough terms...
  const newTerms = potentialNewTerms.slice(0, numNewTermsToInclude);

  const realNumChallenges =
    reviewChallengesFound + newTerms.length * showsPerSessionForBox(0);

  const lesson: Lesson = {
    id: desiredId,
    terms: [...newTerms, ...reviewTerms.map((t) => t.key)],
    startedAt: null,
    completedAt: null,
    createdAt: Date.now(),
    createdFor: getToday(),
    numChallenges: realNumChallenges,
    type: "DAILY",
  };

  return {
    type: "SUCCESS",
    result: {
      lesson,
      setsToAdd: setsToAdd.map((s) => s.id),
    },
  };
}
