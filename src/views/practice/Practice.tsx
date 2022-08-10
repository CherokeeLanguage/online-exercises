import { ReactElement } from "react";
import { Route, Routes, useParams } from "react-router-dom";
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
      <h2>Practice terms</h2>
      <p>Pick an exercise from the list below to start working on terms.</p>
      <ul>
        <li>
          {exercises.map(({ name, path }, idx) => (
            <StyledLink to={path} key={idx}>
              {name}
            </StyledLink>
          ))}
        </li>
      </ul>
    </div>
  );
}
