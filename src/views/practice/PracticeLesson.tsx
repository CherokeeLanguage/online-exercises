import { ReactElement } from "react";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import {
  Exercise,
  ExerciseComponentProps,
} from "../../components/exercises/Exercise";
import { SimilarTerms } from "../../components/exercises/SimilarTerms";
import { SimpleFlashcards } from "../../components/exercises/SimpleFlashcards";
import { FillInTheTone } from "../../components/exercises/FillInTheTone";
import { PickExercise } from "./PickExercise";
import { LessonProvider } from "../../providers/LessonProvider";
import { CombinedLesson } from "../../components/exercises/CombinedLesson";

export const exercises: {
  path: string;
  name: string;
  description: string;
  Component: (props: ExerciseComponentProps) => ReactElement;
  // set to true if game is a minigame that does not require the user to have vocab
  minigame?: boolean;
}[] = [
  {
    path: "combined-lesson",
    name: "Combined lesson",
    description:
      "Practice with a mix of flashcards, multiple choice, listening exercises, and more!",
    Component: CombinedLesson,
  },
  {
    path: "flashcards",
    name: "Flashcards",
    description:
      "Practice terms by reviewing them as flashcards with Cherokee and English audio. Takes about 10-20 minutes.",
    Component: SimpleFlashcards,
  },
  {
    path: "similar-terms",
    name: "Similar terms",
    description:
      "Practice terms by listening to Cherokee audio and choosing between similar sounding answers. Often takes less time than flashcards, but often leads to more mistakes.",
    Component: SimilarTerms,
  },
  {
    path: "fill-in-the-tone",
    name: "Fill in the tone",
    description:
      "Practice your tone accuracy by filling in the tone sequence for the missing word in the term.",
    Component: FillInTheTone,
    minigame: true,
  },
];

export function PracticeLesson(): ReactElement {
  const { lessonId } = useParams();
  // TODO: navigate instead
  if (lessonId === undefined) throw new Error("Must have a lesson to practice");
  const navigate = useNavigate();
  return (
    <LessonProvider
      lessonId={lessonId}
      onLessonDoesNotExist={() => navigate("/")}
    >
      <Routes>
        <Route index element={<PickExercise />} />
        {exercises.map(({ path, Component, name }, idx) => (
          <Route
            key={idx}
            path={path}
            element={<Exercise Component={Component} name={name} />}
          />
        ))}
      </Routes>
    </LessonProvider>
  );
}
