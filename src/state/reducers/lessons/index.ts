import React, { Dispatch } from "react";
import { getToday } from "../../../utils/dateUtils";
import { v4 } from "uuid";
import { vocabSets } from "../../../data/vocabSets";
import { UserState } from "../../UserStateProvider";
import { Act, ImperativeBlock } from "../../../utils/useReducerWithImperative";
import { ReviewResult } from "../leitnerBoxes";
import { createLessonTransaction } from "./createNewLesson";
import { UserStateAction } from "../../actions";
import { showsPerSessionForBox } from "../../../spaced-repetition/usePimsleurTimings";
import { cherokeeToKey } from "../../../data/cards";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../../firebase";

export interface DailyLesson {
  type: "DAILY";
}

export interface PracticeLesson {
  type: "PRACTICE";
  includedSets: string[];
}

export interface LessonMixin {
  /** Lesson id */
  id: string;
  /** Terms in the lesson */
  terms: string[];
  /** Time when the lesson was created */
  createdAt: number;
  /** Time when the lesson was started */
  startedAt: number | null;
  /** Time when the lesson was completed */
  completedAt: number | null;
  /** Day the lesson was planned for */
  createdFor: number;
  /** Number of challenges in the lesson */
  numChallenges: number;
}

type LessonMeta = PracticeLesson | DailyLesson;

export type Lesson = LessonMixin & LessonMeta;

export function lessonKey(lessonId: string) {
  return `lesson/${lessonId}`;
}

export function nameForLesson(lesson: Lesson) {
  switch (lesson.type) {
    case "DAILY":
      return `Daily lesson on ${new Date(lesson.createdFor).toDateString()}`;
    case "PRACTICE":
      return `Practice lesson with ${lesson.includedSets
        .map((setId) => `'${vocabSets[setId].title}'`)
        .join(", ")}`;
  }
}

export type LessonsState = Record<string, Lesson>;

export interface LessonsInteractors {
  startLesson: (lessonId: string) => void;
  concludeLesson: (
    lesson: Lesson,
    reviewedTerms: Record<string, ReviewResult>
  ) => void;
  createNewLesson: (
    desiredId: string,
    numChallenges: number,
    reviewOnly: boolean
  ) => void;
  createPracticeLesson: (
    desiredId: string,
    setsToInclude: string[],
    shuffleTerms: boolean
  ) => void;
}

export function reduceLessonsState(
  { lessons }: UserState,
  action: UserStateAction
): Record<string, Lesson> {
  switch (action.type) {
    case "ADD_LESSON":
      return {
        ...lessons,
        [action.lesson.id]: action.lesson,
      };
    case "START_LESSON":
      return {
        ...lessons,
        [action.lessonId]: {
          ...lessons[action.lessonId],
          startedAt: Date.now(),
        },
      };
    case "CONCLUDE_LESSON":
      return {
        ...lessons,
        [action.lesson.id]: {
          ...lessons[action.lesson.id],
          completedAt: Date.now(),
        },
      };
  }
  return lessons;
}

function shuffled<T>(list: T[]): T[] {
  return list
    .map((item) => [Math.random(), item] as const)
    .sort(([a], [b]) => a - b)
    .map(([, item]) => item);
}

/**
 * Create a `Lesson` object for practicing specific terms outside of tracked
 * progress.
 */
function practiceLessonForSets(
  desiredId: string,
  setsToInclude: string[],
  shuffleTerms: boolean
): Lesson {
  const sets = setsToInclude.map((id) => vocabSets[id]);
  const terms = sets.flatMap((s) => s.terms);
  const numChallenges = showsPerSessionForBox(0) * terms.length;
  const termKeys = terms.map((t) => cherokeeToKey(t));
  return {
    id: desiredId,
    terms: shuffleTerms ? shuffled(termKeys) : termKeys,
    startedAt: null,
    completedAt: null,
    createdAt: Date.now(),
    createdFor: getToday(),
    numChallenges,
    includedSets: setsToInclude,
    type: "PRACTICE",
  };
}

export function useLessonsInteractors(
  _state: UserState,
  dispatch: Dispatch<UserStateAction>,
  dispatchImperativeBlock: Dispatch<ImperativeBlock<UserState, UserStateAction>>
): LessonsInteractors {
  function createNewLesson(
    desiredId: string,
    numChallenges: number,
    reviewOnly: boolean
  ) {
    dispatchImperativeBlock((state, act) =>
      createLessonTransaction(desiredId, numChallenges, reviewOnly, state, act)
    );
  }

  return {
    startLesson(lessonId) {
      logEvent(analytics, "lesson_started", {
        lessonId,
      });
      dispatch({
        type: "START_LESSON",
        lessonId,
      });
    },
    concludeLesson(lesson, reviewedTerms) {
      logEvent(analytics, "lesson_finished", {
        lessonId: lesson.id,
      });
      dispatch({
        type: "CONCLUDE_LESSON",
        lesson,
        reviewedTerms,
      });
    },
    createNewLesson,
    createPracticeLesson(lessonId, setsToInclude, shuffleTerms) {
      const lesson = practiceLessonForSets(
        lessonId,
        setsToInclude,
        shuffleTerms
      );
      dispatch({
        type: "ADD_LESSON",
        lesson,
      });
    },
  };
}
