import { termsByLesson } from "./clean-cll-data";

export function lessonNameValid(lessonName: string): boolean {
  return lessonName in termsByLesson;
}

/**
 * Find all terms used in a lesson, or all terms in lessons up to that lesson.
 */
export function getTerms(lessonName: string, cumulative: boolean): string[] {
  if (!cumulative) return termsByLesson[lessonName];

  const allLessons = Object.keys(
    termsByLesson
  ) as (keyof typeof termsByLesson)[];

  const lessonIdx = allLessons.findIndex((lesson) => lesson === lessonName);
  const lessonsInSession = allLessons.slice(0, lessonIdx + 1);

  return lessonsInSession.flatMap((lesson) => termsByLesson[lesson]);
}
