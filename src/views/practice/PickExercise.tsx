import styled from "styled-components";
import { ButtonLink } from "../../components/Button";
import { SectionHeading } from "../../components/SectionHeading";
import { theme } from "../../theme";
import { exercises } from "./PracticeLesson";

const ExercisesWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
`;

export function PickExercise() {
  return (
    <div>
      <SectionHeading>Pick an exercise</SectionHeading>
      <br />
      <ExercisesWrapper>
        {exercises.map((exercise, idx) => (
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
