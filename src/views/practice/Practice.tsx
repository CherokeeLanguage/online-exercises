import { ReactElement } from "react";
import { Route, Routes, useParams } from "react-router-dom";
import { ButtonLink } from "../../components/Button";
import { SectionHeading } from "../../components/SectionHeading";
import { StyledLink } from "../../components/StyledLink";
import { Exercise, ExerciseComponentProps } from "./exercises/Exercise";
import { SimilarTerms } from "./exercises/SimilarTerms";
import { SimpleFlashcards } from "./exercises/SimpleFlashcards";

const exercises: {
  path: string;
  name: string;
  Component: (props: ExerciseComponentProps) => ReactElement;
}[] = [
  {
    path: "flashcards",
    name: "Flashcards",
    Component: SimpleFlashcards,
  },
  {
    path: "similar-terms",
    name: "Similar terms",
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

function PickExercise() {
  return (
    <div>
      <SectionHeading>Practice terms</SectionHeading>
      <p>Pick an exercise from the list below to start working on terms.</p>
      <ul>
        {exercises.map(({ name, path }, idx) => (
          <li key={idx}>
            <ButtonLink to={path}>{name}</ButtonLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
