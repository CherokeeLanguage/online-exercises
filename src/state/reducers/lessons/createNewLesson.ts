import { act } from "react-dom/test-utils";
import { Lesson } from ".";
import { VocabSet, collections } from "../../../data/vocabSets";
import { termNeedsPractice } from "../../../spaced-repetition/groupTermsIntoLessons";
import { TermStats } from "../../../spaced-repetition/types";
import { showsPerSessionForBox } from "../../../spaced-repetition/usePimsleurTimings";
import { getToday } from "../../../utils/dateUtils";
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
): [VocabSet[], number] {
  if (state.upstreamCollection === undefined)
    throw new Error(
      "No upstream collection. This should have been checked before calling."
    );
  const collection = collections[state.upstreamCollection];
  const remainingSetsInCollection = collection.sets.filter(
    (set) => !(set.id in state.sets)
  );

  const [setsToAdd, termsFound] = scanWhile(
    remainingSetsInCollection,
    (termsFound, set) => termsFound + set.terms.length,
    (termsFound) => termsFound <= numNewTermsNeeded,
    0
  );

  if (termsFound < numNewTermsNeeded)
    throw new Error("Not enough terms in upstream set to create a lesson");

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
  if (state.upstreamCollection === undefined)
    return act({
      type: "LESSON_CREATE_ERROR",
      error: {
        lessonId: desiredId,
        type: LessonCreationErrorType.NOT_ENOUGH_NEW_TERMS_FOR_LESSON,
      },
    });

  const [setsToAdd, termsFound] = pullNewSets(
    state,
    numNewTermsToInclude - potentialNewTerms.length
  );

  if (termsFound < numNewTermsToInclude)
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

  return fetchNewTermsIfNeeded(
    desiredId,
    numNewTermsToInclude,
    state,
    act
  ).then((state, act) => {
    // if something has gone wrong, bail
    if (state.lessonCreationError?.lessonId === desiredId) return act();

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
    if (
      reviewChallengesFound + numNewTermChallenges <
      0.8 * desiredNumChallenges
    ) {
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
