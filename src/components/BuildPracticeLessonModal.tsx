import { ReactElement, useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 } from "uuid";
import { collections, VocabSet, vocabSets } from "../data/vocabSets";
import { useUserStateContext } from "../providers/UserStateProvider";
import { ConfirmationModal } from "./ConfirmationModal";

export function BuildPracticeLessonModal({
  set,
  close,
}: {
  set: VocabSet;
  close: () => void;
}): ReactElement {
  const { createPracticeLesson } = useUserStateContext();
  const navigate = useNavigate();
  function startPracticeLesson() {
    const id = v4();
    createPracticeLesson(id, [set.id], false);
    navigate(`/practice/${id}`);
  }

  return (
    <ConfirmationModal
      title={`Build practice lesson`}
      close={close}
      confirm={startPracticeLesson}
      confirmContent={<>Practice these {set.terms.length} terms now!</>}
    >
      <p>
        You are starting a one-off practice session. Your answers will not be
        used to update your learning progress and you will not see review terms.
      </p>
      <p>
        If you want to work on these terms as part of your daily lessons, start
        learning this collection and they will be introduced automatically.
      </p>
      <p>
        Lesson contents:{" "}
        <em>
          {collections[set.collection].title} - {set.title}
        </em>
      </p>
    </ConfirmationModal>
  );
}
