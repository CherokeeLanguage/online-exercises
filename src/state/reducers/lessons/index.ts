import React, { Dispatch } from "react";
import { getToday } from "../../../utils/dateUtils";
import { v4 } from "uuid";
import { vocabSets } from "../../../data/vocabSets";
import { UserState } from "../../UserStateProvider";
import { Act, ImperativeBlock } from "../../../utils/useReducerWithImperative";
import { ReviewResult } from "../leitnerBoxes";
import { createLessonTransaction } from "./createNewLesson";
import { UserStateAction } from "../../actions";

export interface DailyLesson {
  type: "DAILY";
}

export interface SetLesson {
  type: "SET";
  setId: string;
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
}

type LessonMeta = SetLesson | DailyLesson;

export type Lesson = LessonMixin & LessonMeta;

export function lessonKey(lessonId: string) {
  return `lesson/${lessonId}`;
}

export function createDailyLesson(terms: string[]): Lesson {
  return {
    id: v4(),
    terms,
    startedAt: null,
    completedAt: null,
    createdAt: Date.now(),
    createdFor: getToday(),
    type: "DAILY",
  };
}

export function nameForLesson(lesson: Lesson) {
  switch (lesson.type) {
    case "DAILY":
      return `Daily lesson`;
    case "SET":
      const set = vocabSets[lesson.setId];
      return `Lesson for set '${set.title}'`;
  }
}

export type LessonsState = Record<string, Lesson>;

export interface LessonsInteractors {
  startLesson: (lessonId: string) => void;
  concludeLesson: (
    lessonId: string,
    reviewedTerms: Record<string, ReviewResult>
  ) => void;
  createNewLesson: (
    desiredId: string,
    numChallenges: number,
    reviewOnly: boolean
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
        [action.lessonId]: {
          ...lessons[action.lessonId],
          completedAt: Date.now(),
        },
      };
  }
  return lessons;
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
      dispatch({
        type: "START_LESSON",
        lessonId,
      });
    },
    concludeLesson(lessonId, reviewedTerms) {
      dispatch({
        type: "CONCLUDE_LESSON",
        lessonId,
        reviewedTerms,
      });
    },
    createNewLesson,
  };
}
