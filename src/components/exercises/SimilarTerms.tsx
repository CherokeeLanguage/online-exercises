import React, { ReactElement } from "react";
import { ExerciseComponentProps } from "./Exercise";
import { ListeningQuestion } from "../challenges/ListeningQuestion";

export function SimilarTerms(props: ExerciseComponentProps): ReactElement {
  return (
    <div>
      <ListeningQuestion {...props} />
    </div>
  );
}
