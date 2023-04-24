import React, { ReactElement } from "react";
import { useNavigate } from "react-router";
import { v4 } from "uuid";
import { Button } from "../../components/Button";
import { collections, JW_LIVING_PHRASES } from "../../data/vocabSets";
import { useUserStateContext } from "../../providers/UserStateProvider";
import { DashboardWidget } from "./DashboardWidget";

export function MinigameWidget(): ReactElement {
  const { createPracticeLesson } = useUserStateContext();
  const navigate = useNavigate();

  function startToneMinigame() {
    const id = v4();
    createPracticeLesson(
      id,
      collections[JW_LIVING_PHRASES].sets.map((s) => s.id),
      true
    );
    navigate(`/practice/${id}/fill-in-the-tone`);
  }

  function startWordMinigame() {
    const id = v4();
    createPracticeLesson(
      id,
      collections[JW_LIVING_PHRASES].sets.map((s) => s.id),
      true
    );
    navigate(`/practice/${id}/fill-in-the-word`);
  }

  return (
    <DashboardWidget title="Minigames">
      <p>Play a game and work with the language - no setup required!</p>
      <div style={{ gap: "16px", display: "flex" }}>
        <Button onClick={() => startToneMinigame()}>Fill in the tone</Button>
        <Button onClick={() => startWordMinigame()}>Fill in the word</Button>
      </div>
    </DashboardWidget>
  );
}
