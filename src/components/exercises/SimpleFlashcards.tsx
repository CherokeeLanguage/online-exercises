import React, { ReactElement } from "react";
import { Flashcard } from "../challenges/Flashcard";
import { ExerciseComponentProps } from "./Exercise";

export function SimpleFlashcards(props: ExerciseComponentProps): ReactElement {
  return (
    <div style={{ maxWidth: "800px", margin: "auto" }}>
      <p>
        Here you can review your terms as flashcards. Click the card to flip
        between Cherokee and English. You can mark if you answered correctly or
        incorrectly with the controls at bottom.
      </p>
      <p>
        If you prefer to use the keyboard you can use the spacebar to flip the
        term, the enter key to mark a card as answered correctly, and the "x"
        key to mark a card as answered incorrectly.
      </p>
      <p>
        You can choose to start with English, but this is much harder and can
        lead to much longer sessions.
      </p>
      <Flashcard {...props} />
    </div>
  );
}
