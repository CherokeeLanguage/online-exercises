import { ReactElement } from "react";
import { Widget, WidgetButton, WidgetTitle } from "./styled";
import { theme } from "../../theme";
import { useUserStateContext } from "../../providers/UserStateProvider";
import { JW_LIVING_PHRASES, collections } from "../../data/vocabSets";
import { useNavigate } from "react-router-dom";
import { v4 } from "uuid";

export function PracticeToneWidget(): ReactElement {
  const { createPracticeLesson } = useUserStateContext();
  const navigate = useNavigate();
  function startToneMinigame() {
    const id = v4();
    createPracticeLesson(
      id,
      collections[JW_LIVING_PHRASES].sets.map((s) => s.id),
      true
    );
    // TODO: make this a function in routes
    navigate(`/practice/${id}/fill-in-the-tone`);
  }
  return (
    <Widget maxWidth={300} background={theme.hanehldaColors.DARK_GRAY}>
      <WidgetTitle>Practice your tone</WidgetTitle>
      <WidgetButton onClick={startToneMinigame}>
        <strong>Begin practice session</strong>
      </WidgetButton>
    </Widget>
  );
}
