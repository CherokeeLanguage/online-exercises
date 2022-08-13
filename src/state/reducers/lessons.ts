import React, { Dispatch } from "react";
import { useEffect, useMemo } from "react";
import { getToday } from "../../utils/dateUtils";
import {
  groupTermsIntoLessons,
  termNeedsPractice,
} from "../../spaced-repetition/groupTermsIntoLessons";
import { v4 } from "uuid";
import { vocabSets } from "../../data/vocabSets";
import { UserState, UserStateAction } from "../UserStateProvider";
import { ImperativeBlock } from "../../utils/useReducerWithImperative";
import { ReviewResult } from "./leitnerBoxes";

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
  /** Time when the lesson was completed */
  completedAt: number | null;
  /** Day the lesson was planned for */
  createdFor: number;
  /** Used to sort lessons of the same kind */
  index: number;
}

type LessonMeta = SetLesson | DailyLesson;

export type Lesson = LessonMixin & LessonMeta;

export function lessonKey(lessonId: string) {
  return `lesson/${lessonId}`;
}

export function createDailyLesson(terms: string[], index: number): Lesson {
  return {
    id: v4(),
    terms,
    completedAt: null,
    createdFor: getToday(),
    index,
    type: "DAILY",
  };
}

export function createSetLesson(
  terms: string[],
  setId: string,
  index: number
): Lesson {
  return {
    id: v4(),
    terms,
    completedAt: null,
    createdFor: getToday(),
    index,
    type: "SET",
    setId,
  };
}

export function nameForLesson(lesson: Lesson) {
  switch (lesson.type) {
    case "DAILY":
      return `Daily lesson ${lesson.index + 1}`;
    case "SET":
      const set = vocabSets[lesson.setId];
      return `Lesson ${lesson.index + 1} for set '${set.title}'`;
  }
}

export type LessonsState = Record<string, Lesson>;

export interface LessonsInteractors {
  todaysLessons: Lesson[];
  concludeLesson: (
    lessonId: string,
    reviewedTerms: Record<string, ReviewResult>
  ) => void;
  refreshLessons: (newLessons: Lesson[], metadata: LessonMeta) => void;
  refreshDailyLessons: () => void;
}

interface RefreshLessons {
  type: "REFRESH_LESSONS";
  lessons: Lesson[];
  metadata: LessonMeta;
}

interface MarkLessonComplete {
  type: "MARK_LESSON_COMPLETE";
  lessonId: string;
}

export type LessonsAction = RefreshLessons | MarkLessonComplete;

function lessonMetadataMatches(
  metadata: LessonMeta,
  filter: LessonMeta
): boolean {
  switch (filter.type) {
    case "SET":
      return metadata.type === filter.type && metadata.setId === filter.setId;
    case "DAILY":
      return metadata.type === filter.type;
  }
}

export function reduceLessonsState(
  lessons: LessonsState,
  action: LessonsAction
): Record<string, Lesson> {
  switch (action.type) {
    case "REFRESH_LESSONS":
      const today = getToday();
      return Object.fromEntries([
        // remove any entires that have matching metadata
        // and were planned for today
        // that never got finished
        ...Object.entries(lessons).filter(
          ([id, lesson]) =>
            !(
              lesson.createdFor === today &&
              lesson.completedAt === null &&
              lessonMetadataMatches(lesson, action.metadata)
            )
        ),
        // add new entries
        ...action.lessons.map((lesson) => [lesson.id, lesson]),
      ]);
    case "MARK_LESSON_COMPLETE":
      return {
        ...lessons,
        [action.lessonId]: {
          ...lessons[action.lessonId],
          completedAt: Date.now(),
        },
      };
  }
}

export function useLessonsInteractors(
  { lessons }: UserState,
  dispatch: Dispatch<UserStateAction>,
  dispatchImperativeBlock: Dispatch<ImperativeBlock<UserState, UserStateAction>>
): LessonsInteractors {
  const today = getToday();
  const todaysLessons = useMemo(
    () =>
      Object.values(lessons)
        .filter(
          (l) =>
            l.createdFor === today &&
            lessonMetadataMatches(l, { type: "DAILY" })
        )
        .sort((a, b) => a.index - b.index),
    [lessons, today]
  );

  function refreshDailyLessons() {
    dispatchImperativeBlock((state, act) => {
      const termsToPracticeToday = Object.values(
        state.leitnerBoxes.terms
      ).filter((term) => termNeedsPractice(term, today));

      const newLessons: Lesson[] = groupTermsIntoLessons(
        termsToPracticeToday
      ).map((terms, lessonIdx) =>
        createDailyLesson(
          terms.map((t) => t.key),
          lessonIdx
        )
      );

      if (newLessons.length) {
        console.log(`Creating ${newLessons.length} lessons...`);
        return act([
          {
            slice: "Lessons",
            action: {
              type: "REFRESH_LESSONS",
              lessons: newLessons,
              metadata: {
                type: "DAILY",
              },
            },
          },
        ]);
      } else {
        // no update
        return state;
      }
    });
  }

  useEffect(() => {
    if (todaysLessons.filter((l) => l.completedAt === null).length === 0) {
      console.log("Creating today's lessons...");
      refreshDailyLessons();
    }
  }, [todaysLessons]);

  return {
    todaysLessons,
    concludeLesson(lessonId, reviewedTerms) {
      dispatchImperativeBlock((state, act) =>
        act([
          {
            slice: "LeitnerBoxes",
            action: {
              type: "conclude_review",
              reviewedTerms,
            },
          },
          {
            slice: "Lessons",
            action: {
              type: "MARK_LESSON_COMPLETE",
              lessonId,
            },
          },
        ])
      );
    },
    refreshLessons(newLessons, metadata) {
      dispatch({
        slice: "Lessons",
        action: {
          type: "REFRESH_LESSONS",
          lessons: newLessons,
          metadata,
        },
      });
    },
    refreshDailyLessons,
  };
}
