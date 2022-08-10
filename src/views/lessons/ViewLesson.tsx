import React, { ReactElement } from "react";
import { Navigate, useParams } from "react-router-dom";
import { Lesson, useLessons } from "../../spaced-repetition/LessonsProvider";

export function ViewLesson(): ReactElement {
  const { lessonId } = useParams();
  const { lessons } = useLessons();
  if (!lessonId) return <Navigate to={"/lessons"} replace />;
  const lesson = lessons[lessonId];
  return <_ViewLesson lesson={lesson} />;
}

export function _ViewLesson({ lesson }: { lesson: Lesson }): ReactElement {
  return <p>View lesson {lesson.id}</p>;
}
