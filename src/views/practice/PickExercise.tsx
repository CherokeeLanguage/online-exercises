import styled from "styled-components";
import { ButtonLink } from "../../components/Button";
import { SectionHeading } from "../../components/SectionHeading";
import { useLesson } from "../../state/useLesson";
import { theme } from "../../theme";
import { exercises } from "./PracticeLesson";

const ExercisesWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  @media screen and (max-width: 800px) {
    grid-template-columns: 1fr;
  }
`;

/**
 * Show a list of options for execises a user can do to complete their vocab lesson.
 */
export function PickExercise({ lessonId }: { lessonId: string }) {
  const { lesson } = useLesson(lessonId);
  return (
    <div>
      <SectionHeading>Pick an exercise</SectionHeading>
      <br />
      <ExercisesWrapper>
        {exercises
          // minigames are only allowed for _practice_ lessons
          .filter((e) => lesson.type === "PRACTICE" || !e.minigame)
          .map((exercise, idx) => (
            <ExerciseCard exercise={exercise} key={idx} />
          ))}
      </ExercisesWrapper>
    </div>
  );
}

const StyledExerciseCard = styled.div`
  border: 2px solid ${theme.colors.MED_GRAY};
  border-radius: 8px;
  box-shadow: 1px 1px 6px ${theme.colors.MED_GRAY};
  padding: 16px;
  flex: 1;
  min-width: 250px;
`;

function ExerciseCard({
  exercise: { path, name, description },
}: {
  exercise: typeof exercises[number];
}) {
  return (
    <StyledExerciseCard>
      <ButtonLink to={path}>{name}</ButtonLink>
      <p>{description}</p>
    </StyledExerciseCard>
  );
}
