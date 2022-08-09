import React, { ReactElement } from "react";
import { useParams } from "react-router-dom";

export function ViewLesson(): ReactElement {
  const { lessonId } = useParams();
  return <p>View lesson {lessonId}</p>;
}
