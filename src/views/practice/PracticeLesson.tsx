import { ReactElement } from "react";
import {
  Outlet,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";
import { Exercise } from "../../components/exercises/Exercise";
import { PickExercise } from "./PickExercise";
import { LessonProvider } from "../../providers/LessonProvider";
import { HanehldaView } from "../../components/HanehldaView";
import { Nav, NavLink } from "../../components/HanehldaView/HanehldaNav";
import { exercises } from "../../components/exercises";

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
        <Route element={<LessonPage />}>
          <Route index element={<PickExercise />} />
          {exercises.map(({ path, Component, name }, idx) => (
            <Route
              key={idx}
              path={path}
              element={<Exercise Component={Component} name={name} />}
            />
          ))}
        </Route>
      </Routes>
    </LessonProvider>
  );
}

export function LessonPage() {
  return (
    <HanehldaView
      navControls={
        <Nav right={<NavLink to="/settings">Settings</NavLink>}>
          <NavLink to="/">Exit</NavLink>
        </Nav>
      }
    >
      <Outlet />
    </HanehldaView>
  );
}
