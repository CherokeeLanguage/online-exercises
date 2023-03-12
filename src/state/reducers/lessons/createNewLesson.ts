import { Lesson } from ".";
import { VocabSet, collections } from "../../../data/vocabSets";
import { TermStats } from "../../../spaced-repetition/types";
import { showsPerSessionForBox } from "../../../spaced-repetition/usePimsleurTimings";
import { DAY, getToday } from "../../../utils/dateUtils";
import { Act, StateWithThen } from "../../../utils/useReducerWithImperative";
import { UserStateAction } from "../../actions";
import { UserState } from "../../UserStateProvider";

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
): [VocabSet[], number] {
  if (state.config.upstreamCollection === null)
    throw new Error(
      "No upstream collection. This should have been checked before calling."
    );
  const collection = collections[state.config.upstreamCollection];
  const remainingSetsInCollection = collection.sets.filter(
    (set) => !(set.id in state.config.sets)
  );

  const [setsToAdd, termsFound] = scanWhile(
    remainingSetsInCollection,
    (termsFound, set) => termsFound + set.terms.length,
    (termsFound) => termsFound <= numNewTermsNeeded,
    0
  );

  return [setsToAdd, termsFound];
}

function fetchNewTermsIfNeeded(
  desiredId: string,
  numNewTermsToInclude: number,
  state: UserState,
  act: Act<UserState, UserStateAction>
) {
  const [_, potentialNewTerms] = splitNewTerms(state);

  // we have enough terms
  if (potentialNewTerms.length >= numNewTermsToInclude) return act();

  // we don't have enough terms AND there's nowhere to get more
  if (state.config.upstreamCollection === undefined)
    return act({
      type: "LESSON_CREATE_ERROR",
      error: {
        lessonId: desiredId,
        type: LessonCreationErrorType.NOT_ENOUGH_NEW_TERMS_FOR_LESSON,
      },
    });

  const numTermsToFind = numNewTermsToInclude - potentialNewTerms.length;

  const [setsToAdd, termsFound] = pullNewSets(state, numTermsToFind);

  if (termsFound < numTermsToFind)
    return act({
      type: "LESSON_CREATE_ERROR",
      error: {
        lessonId: desiredId,
        type: LessonCreationErrorType.NOT_ENOUGH_NEW_TERMS_FOR_LESSON,
      },
    });

  return act(
    ...setsToAdd.map((set) => ({
      type: "ADD_SET" as const,
      setToAdd: set.id,
    }))
  );
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
 * @param desiredNumChallenges
 * @param state
 * @param act
 * @returns
 */
export function createLessonTransaction(
  desiredId: string,
  desiredNumChallenges: number,
  reviewOnly: boolean,
  state: UserState,
  act: Act<UserState, UserStateAction>,
  suggestedNewTermsToInclude?: number
): StateWithThen<UserState, UserStateAction> {
  // if the lesson was already created, don't make it again
  if (desiredId in state.lessons) return act();

  // 10 terms for 15 minute lesson
  // TODO: finetune this
  // this may change if not enough review terms are available
  const numNewTermsToInclude =
    suggestedNewTermsToInclude ??
    (reviewOnly ? 0 : Math.floor(desiredNumChallenges / 12));

  const minChallenges = reviewOnly
    ? 0.5 * desiredNumChallenges // review only lessons can be shorter (so your last reivew lesson can be completed more often)
    : 0.85 * desiredNumChallenges; // lessons with new terms should always be about full length

  return fetchNewTermsIfNeeded(
    desiredId,
    numNewTermsToInclude,
    state,
    act
  ).then((state, act) => {
    // if something has gone wrong, bail
    if (state.ephemeral.lessonCreationError?.lessonId === desiredId)
      return act();

    // split terms into review terms and new terms
    const [potentialReviewTerms, potentialNewTerms] = splitNewTerms(state);

    console.log({
      potentialReviewTerms: potentialReviewTerms.length,
      potentialNewTerms: potentialNewTerms.length,
    });

    // new terms are in box 0, by definition
    const numNewTermChallenges =
      numNewTermsToInclude * showsPerSessionForBox(0);
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
        return act({
          type: "LESSON_CREATE_ERROR",
          error: {
            lessonId: desiredId,
            type: LessonCreationErrorType.NOT_ENOUGH_TERMS_FOR_REVIEW_LESSON,
          },
        });
      } else {
        // try to fill lesson with new terms
        return createLessonTransaction(
          desiredId,
          desiredNumChallenges,
          reviewOnly,
          state,
          act,
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
      terms: [...newTerms, ...reviewTerms].map((t) => t.key),
      startedAt: null,
      completedAt: null,
      createdAt: Date.now(),
      createdFor: getToday(),
      numChallenges: realNumChallenges,
      type: "DAILY",
    };

    return act({
      type: "ADD_LESSON",
      lesson,
    });
  });
}
