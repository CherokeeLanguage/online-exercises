import React, { ReactNode, useContext } from "react";
import { ReactElement, useEffect, useMemo } from "react";
import { useLocalStorage } from "react-use";
import { getToday } from "../utils/dateUtils";
import { groupTermsIntoLessons } from "./groupTermsIntoLessons";
import { useLeitnerBoxContext } from "./LeitnerBoxProvider";

export interface Lesson {
  /** Lesson id */
  id: string;
  /** Terms in the lesson */
  terms: string[];
  /** Time when the lesson was completed */
  completedAt: number | null;
  /** Day the lesson was planned for */
  createdFor: number;
}

export function lessonKey(lessonId: string) {
  return `lesson/${lessonId}`;
}

export function createLesson(lessonId: string, terms: string[]): Lesson {
  return {
    id: lessonId,
    terms,
    completedAt: null,
    createdFor: getToday(),
  };
}

export interface LessonsContext {
  lessons: Record<string, Lesson>;
  todaysLessons: Lesson[];
  upsertLesson: (upsert: Lesson) => void;
}

const lessonsContext = React.createContext<LessonsContext | null>(null);

export function LessonsProvider({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const leitnerBoxes = useLeitnerBoxContext();

  const [storedLessons, setLessons] = useLocalStorage<Record<string, Lesson>>(
    "lessons",
    undefined,
    {
      raw: false,
      serializer: JSON.stringify,
      deserializer: JSON.parse,
    }
  );

  const lessons = storedLessons ?? {};

  function upsertLesson(upsert: Lesson) {
    setLessons({
      ...lessons,
      [upsert.id]: { ...lessons?.[upsert.id], ...upsert },
    });
  }

  const today = getToday();
  const todaysLessons = useMemo(
    () =>
      Object.values(lessons)
        .filter((l) => l.createdFor === today)
        .sort((a, b) => a.id.localeCompare(b.id)),
    [lessons, today]
  );

  useEffect(() => {
    if (todaysLessons.length === 0) {
      console.log("Creating today's lessons...");
      const lessonPrefix = new Date(today).toISOString();
      const newLessons: Lesson[] = groupTermsIntoLessons(
        Object.values(leitnerBoxes.state.terms)
      ).map((terms, lessonIdx) =>
        createLesson(
          `${lessonPrefix}-${lessonIdx}`,
          terms.map((t) => t.key)
        )
      );
      console.log(`Creating ${newLessons.length} lessons...`);
      newLessons.forEach(upsertLesson);
    }
  }, [todaysLessons]);

  return (
    <lessonsContext.Provider value={{ lessons, upsertLesson, todaysLessons }}>
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

export function useLesson(lessonId: string): [Lesson, () => void] {
  const { lessons, upsertLesson } = useLessons();
  const lesson = useMemo(() => lessons[lessonId], [lessons, lessonId]);
  if (!lesson) throw new Error("Unknown lesson");
  return [
    lesson,
    () => {
      upsertLesson({ ...lesson, completedAt: getToday() });
    },
  ];
}
