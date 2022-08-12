import React, { ReactNode, useContext, useReducer } from "react";
import { ReactElement, useEffect, useMemo } from "react";
import { useLocalStorage } from "react-use";
import { getToday } from "../utils/dateUtils";
import {
  groupTermsIntoLessons,
  termNeedsPractice,
} from "./groupTermsIntoLessons";
import { useLeitnerBoxContext } from "./LeitnerBoxProvider";
import { v4 } from "uuid";
import { vocabSets } from "../data/vocabSets";

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

export interface LessonsContext {
  lessons: Record<string, Lesson>;
  todaysLessons: Lesson[];
  markLessonComplete: (lessonId: string) => void;
  refreshLessons: (newLessons: Lesson[], metadata: LessonMeta) => void;
}

const lessonsContext = React.createContext<LessonsContext | null>(null);

interface RefreshLessons {
  type: "REFRESH_LESSONS";
  lessons: Lesson[];
  metadata: LessonMeta;
}

interface MarkLessonComplete {
  type: "MARK_LESSON_COMPLETE";
  lessonId: string;
}

type LessonsAction = RefreshLessons | MarkLessonComplete;

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

function reduceLessonState(
  lessons: Record<string, Lesson>,
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

export function LessonsProvider({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const leitnerBoxes = useLeitnerBoxContext();

  const [storedLessons, setStoredLessons] = useLocalStorage<
    Record<string, Lesson>
  >("lessons", undefined, {
    raw: false,
    serializer: JSON.stringify,
    deserializer: JSON.parse,
  });

  const [lessons, dispatch] = useReducer(
    reduceLessonState,
    storedLessons ?? {}
  );

  useEffect(() => setStoredLessons(lessons), [lessons]);

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

  useEffect(() => {
    if (todaysLessons.filter((l) => l.completedAt === null).length === 0) {
      console.log("Creating today's lessons...");

      const termsToPracticeToday = Object.values(
        leitnerBoxes.state.terms
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
        dispatch({
          type: "REFRESH_LESSONS",
          lessons: newLessons,
          metadata: {
            type: "DAILY",
          },
        });
      }
    }
  }, [todaysLessons]);

  return (
    <lessonsContext.Provider
      value={{
        lessons,
        todaysLessons,
        markLessonComplete(lessonId) {
          dispatch({
            type: "MARK_LESSON_COMPLETE",
            lessonId,
          });
        },
        refreshLessons(newLessons, metadata) {
          dispatch({
            type: "REFRESH_LESSONS",
            lessons: newLessons,
            metadata,
          });
        },
      }}
    >
      {children}
    </lessonsContext.Provider>
  );
}

export function useLessons(): LessonsContext {
  const context = useContext(lessonsContext);
  if (!context)
    throw new Error("Use Lessons MUST be used under a LessonsProvider");
  return context;
}

/**
 * Returns a lesson and an imperative function to mark the lesson as completed.
 */
export function useLesson(lessonId: string): [Lesson, () => void] {
  const { lessons, markLessonComplete } = useLessons();
  const lesson = lessons[lessonId];
  if (!lesson) throw new Error("Unknown lesson");
  return [
    lesson,
    () => {
      markLessonComplete(lesson.id);
    },
  ];
}
