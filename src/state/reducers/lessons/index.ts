import React, { Dispatch } from "react";
import { getToday } from "../../../utils/dateUtils";
import { vocabSets } from "../../../data/vocabSets";
import { UserState } from "../../useUserState";
import { LessonsAction, UserStateAction } from "../../actions";
import { showsPerSessionForBox } from "../../../spaced-repetition/usePimsleurTimings";
import { cherokeeToKey } from "../../../data/cards";
import { useAuth } from "../../../firebase/AuthProvider";
import { lessonMetadataPath, setTyped } from "../../../firebase/paths";
import { LessonPlan } from "./planLesson";

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
  createNewLesson: (desiredId: string, plan: LessonPlan) => Promise<void>;
  createPracticeLesson: (
    desiredId: string,
    setsToInclude: string[],
    shuffleTerms: boolean
  ) => Promise<void>;
}

export function reduceLesson(lesson: Lesson, action: LessonsAction): Lesson {
  switch (action.type) {
    case "START_LESSON":
      return {
        ...lesson,
        startedAt: Date.now(),
      };
    case "CONCLUDE_LESSON":
      return {
        ...lesson,
        completedAt: Date.now(),
      };
  }
  return lesson;
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

/**
 * Global state interactors for lessons;
 */
export function useLessonInteractors(
  state: UserState,
  dispatch: Dispatch<UserStateAction>
): LessonsInteractors {
  const { user } = useAuth();
  return {
    createNewLesson(desiredId, plan) {
      plan.setsToAdd.forEach((setToAdd) =>
        dispatch({
          type: "ADD_SET",
          setToAdd,
        })
      );
      // I'm not sure why the compiler is being difficult here
      const lesson: Lesson = {
        ...(plan.lesson as Omit<LessonMixin & DailyLesson, "id">),
        id: desiredId,
      };
      return setTyped(lessonMetadataPath(user, desiredId), lesson);
    },
    createPracticeLesson(lessonId, setsToInclude, shuffleTerms) {
      const lesson = practiceLessonForSets(
        lessonId,
        setsToInclude,
        shuffleTerms
      );
      return setTyped(lessonMetadataPath(user, lesson.id), lesson);
    },
  };
}
