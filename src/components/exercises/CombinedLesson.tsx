import React, { ReactElement, useMemo } from "react";
import { ExerciseComponentProps } from "./Exercise";
import { NewTermIntroduction } from "../challenges/NewTermIntroduction";
import { RecallQuestion } from "../challenges/RecallQuestion";
import { ListeningQuestion } from "../challenges/ListeningQuestion";
import { pickRandomElement } from "./utils";
import { MultipleChoiceQuestion } from "../challenges/MultipleChoiceQuestion";

export function CombinedLesson(props: ExerciseComponentProps): ReactElement {
  const Content = useMemo(
    () =>
      props.currentCard.needsIntroduction
        ? NewTermIntroduction
        : props.currentCard.stats.box < 3
        ? pickRandomElement([
            RecallQuestion,
            ListeningQuestion,
            MultipleChoiceQuestion,
          ])
        : RecallQuestion,
    [props.currentCard]
  );
  return (
    <div style={{ maxWidth: "800px", margin: "auto" }}>
      <Content {...props} />
    </div>
  );
}
