import { ReactElement } from "react";
import { Route, Routes, useParams } from "react-router-dom";
import {
  Exercise,
  ExerciseComponentProps,
} from "../../components/exercises/Exercise";
import { SimilarTerms } from "../../components/exercises/SimilarTerms";
import { SimpleFlashcards } from "../../components/exercises/SimpleFlashcards";
import { PickExercise } from "./PickExercise";

export const exercises: {
  path: string;
  name: string;
  description: string;
  Component: (props: ExerciseComponentProps) => ReactElement;
}[] = [
  {
    path: "flashcards",
    name: "Flashcards",
    description:
      "Practice terms by reviewing them as flashcards with Cherokee and English audio. Takes about twenty 10-20 minutes.",
    Component: SimpleFlashcards,
  },
  {
    path: "similar-terms",
    name: "Similar terms",
    description:
      "Practice terms by listening to Cherokee audio and choosing between similar sounding answers. Often takes less time than flashcards, but often leads to more mistakes.",
    Component: SimilarTerms,
  },
];

export function PracticeLesson(): ReactElement {
  const { lessonId } = useParams();
  // TODO: navigate instead
  if (lessonId === undefined) throw new Error("Must have a lesson to practice");
  return (
    <Routes>
      <Route index element={<PickExercise />} />
      {exercises.map(({ path, Component }, idx) => (
        <Route
          key={idx}
          path={path}
          element={<Exercise Component={Component} lessonId={lessonId} />}
        />
      ))}
    </Routes>
  );
}
