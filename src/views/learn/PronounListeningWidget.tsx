import { ReactElement } from "react";
import { Widget, WidgetButton, WidgetTitle } from "./styled";
import { theme } from "../../theme";
import { useUserStateContext } from "../../providers/UserStateProvider";
import { JW_LIVING_PHRASES, collections } from "../../data/vocabSets";
import { useNavigate } from "react-router-dom";
import { v4 } from "uuid";
import { PracticeLessonWithExercisePath } from "../../routing/paths";
import { SimpleFlashcards } from "../../components/exercises/SimpleFlashcards";
import { SimilarTermsInfo } from "../../components/exercises";

// list of sets of single words with pronouns
const PRONOUN_PRACTICE_SETS: string[] = [
  "WALC1:1 - Set A - Reading",
  "WALC1:1 - Set A - Diving",
  "WALC1:1 - Set A - Understanding",
  "WALC1:1 - Set B - Mother",
  "WALC1:1 - Set B - Wanting",
  "WALC1:1 - Set B - Hungry",
];

export function PronounListeningWidget(): ReactElement {
  const { createPracticeLesson } = useUserStateContext();
  const navigate = useNavigate();
  function startPronounMinigame() {
    const id = v4();
    createPracticeLesson(id, PRONOUN_PRACTICE_SETS, true);

    navigate(
      PracticeLessonWithExercisePath({
        lessonId: id,
        exercisePath: SimilarTermsInfo.path,
      })
    );
  }
  return (
    <Widget maxWidth={500} background={theme.hanehldaColors.LIGHT_GRAY}>
      <WidgetTitle>Practice listening for pronouns</WidgetTitle>
      <WidgetButton onClick={startPronounMinigame}>
        <strong>Begin practice session</strong>
      </WidgetButton>
    </Widget>
  );
}
