import React, { ReactElement } from "react";
import { ExerciseComponentProps } from "./Exercise";
import { ListeningQuestion } from "../challenges/ListeningQuestion";

export function SimilarTerms(props: ExerciseComponentProps): ReactElement {
  return (
    <div style={{ maxWidth: "800px", margin: "auto" }}>
      <ListeningQuestion {...props} />
    </div>
  );
}
