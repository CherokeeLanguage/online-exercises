import { ReactElement, ReactNode, useMemo } from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { StyledLink } from "./components/StyledLink";
import { lessonNameValid, getTerms } from "./data/utils";
import { SimilarTerms } from "./exercises/SimilarTerms";
import { SimpleFlashcards } from "./exercises/SimpleFlashcards";
import { useLeitnerBoxContext } from "./utils/LeitnerBoxProvider";

const exercises: {
  path: string;
  name: string;
  Component: (props: { lessonTerms: string[] }) => ReactElement;
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

export function Practice(): ReactElement {
  console.log("Practice rendered");
  return (
    <Routes>
      <Route path="/" element={<Navigate to="all" replace />} />
      <Route path="all/*" element={<PracticeAllTerms />}></Route>
      <Route
        path="lesson/:lessonName/:cumulative/*"
        element={<PracticeLesson />}
      ></Route>
    </Routes>
  );
}

function PracticeAllTerms(): ReactElement {
  const leitnerBoxes = useLeitnerBoxContext();

  const lessonTerms = useMemo(
    () => Object.keys(leitnerBoxes.state.terms),
    [leitnerBoxes.state.terms]
  );

  return (
    <Routes>
      <Route index element={<PickExercise />} />
      {exercises.map(({ path, Component }, idx) => (
        <Route
          key={idx}
          path={path}
          element={<Component lessonTerms={lessonTerms} />}
        />
      ))}
    </Routes>
  );
}

function PracticeLesson(): ReactElement {
  console.log("Practice LESSON rendered");
  const { lessonName, cumulative: rawCumulative } = useParams();
  const cumulative = rawCumulative?.toLowerCase() === "true";
  // if (!lessonName) throw new Error("Lesson name is required");
  // if (!lessonNameValid(lessonName)) throw new Error("Lesson name not found");

  const lessonTerms = useMemo(
    () => getTerms(lessonName!, cumulative),
    [lessonName, cumulative]
  );

  return (
    <Routes>
      <Route index element={<PickExercise />} />
      {exercises.map(({ path, Component }, idx) => (
        <Route
          key={idx}
          path={path}
          element={<Component lessonTerms={lessonTerms} />}
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
          {exercises.map(({ name, path }) => (
            <StyledLink to={path}>{name}</StyledLink>
          ))}
        </li>
      </ul>
    </div>
  );
}
