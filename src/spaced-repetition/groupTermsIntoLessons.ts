import { DAY } from "../utils/dateUtils";
import { TermStats } from "./types";
import { showsPerSessionForBox } from "./usePimsleurTimings";

export function termNeedsPractice(
  term: TermStats | undefined,
  today: number
): boolean {
  // needs practice if never reviewed
  if (!term) return true;
  // term needs practice if next show date is before tomorrow
  else return term.nextShowDate < today + DAY;
}

export const MAX_CHALLENGES_PER_SESSION = 120;

/**
 * Decide which terms need to be practiced today.
 */
export function groupTermsIntoLessons(terms: TermStats[]): TermStats[][] {
  // start with overdue
  const orderedTerms = terms
    .slice(0)
    .sort((a, b) => a.nextShowDate - b.nextShowDate);

  const termsGroupedIntoLessons = orderedTerms.reduce<{
    lessons: TermStats[][];
    currentLesson: TermStats[];
    currentLessonChallenges: number;
  }>(
    (state, term) => {
      const termShows = showsPerSessionForBox(term.box);
      if (
        state.currentLessonChallenges + showsPerSessionForBox(term.box) >
        MAX_CHALLENGES_PER_SESSION
      ) {
        return {
          lessons: [...state.lessons, state.currentLesson],
          currentLesson: [term],
          currentLessonChallenges: termShows,
        };
      } else {
        return {
          lessons: state.lessons,
          currentLesson: [...state.currentLesson, term],
          currentLessonChallenges: state.currentLessonChallenges + termShows,
        };
      }
    },
    {
      lessons: [],
      currentLesson: [],
      currentLessonChallenges: 0,
    }
  );

  if (termsGroupedIntoLessons.currentLesson.length) {
    return [
      ...termsGroupedIntoLessons.lessons,
      termsGroupedIntoLessons.currentLesson,
    ];
  } else {
    return termsGroupedIntoLessons.lessons;
  }
}
