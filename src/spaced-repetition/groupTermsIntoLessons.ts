import { getToday } from "../utils/dateUtils";
import { TermStats } from "./types";
import { showsPerSessionForBox } from "./usePimsleurTimings";

export function termNeedsPractice(
  term: TermStats | undefined,
  today: number
): boolean {
  // needs practice if never reviewed
  if (!term) return true;
  // term needs practice if next show date is today or earlier (lapsed)
  else return term.nextShowDate <= today;
}

export const MAX_CHALLENGES_PER_SESSION = 60;

/**
 * Decide which terms need to be practiced today.
 */
export function groupTermsIntoLessons(terms: TermStats[]): TermStats[][] {
  const today = getToday();
  const termsToPractice = terms
    .filter((s) => termNeedsPractice(s, today))
    .sort((a, b) => a.nextShowDate - b.nextShowDate);

  const termsGroupedIntoLessons = termsToPractice.reduce<{
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