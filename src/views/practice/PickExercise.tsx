import styled from "styled-components";
import { useLesson } from "../../providers/LessonProvider";
import { useAnalyticsPageName } from "../../firebase/hooks";
import { devices, theme } from "../../theme";
import { exercises } from "./PracticeLesson";
import { Hr } from "../setup/common";
import { Link } from "react-router-dom";

const ExercisesWrapper = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;
  @media ${devices.laptop} {
    grid-template-columns: 1fr 1fr;
  }
`;

const PickExerciseHeading = styled.h2`
  color: ${theme.hanehldaColors.DARK_RED};
`;

/**
 * Show a list of options for execises a user can do to complete their vocab lesson.
 */
export function PickExercise() {
  const { lesson } = useLesson();
  useAnalyticsPageName("Pick exercise");
  return (
    <div>
      <PickExerciseHeading>Pick an exercise</PickExerciseHeading>
      <Hr />
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

const StartExerciseButton = styled.a`
  display: inline-block;
  border-radius: 8px;
  border: 1px solid black;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  background-color: ${theme.colors.WHITE};
  color: ${theme.hanehldaColors.DARK_GRAY};
  text-decoration: none;
  font-size: 1.5em;
  padding: 4px 8px;
  margin: 0;
  margin-bottom: 8px;
`;

const StyledExerciseCard = styled.div`
  border: 1px solid black;
  background-color: ${theme.hanehldaColors.DARK_BLUE};
  margin: 0 8px;
  border-radius: 8px;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  padding: 16px;
  flex: 1;
  min-width: 250px;
  p {
    color: ${theme.colors.WHITE};
    font-size: 1.25em;
    margin: 0;
  }
`;

function ExerciseCard({
  exercise: { path, name, description },
}: {
  exercise: (typeof exercises)[number];
}) {
  return (
    <StyledExerciseCard>
      <StartExerciseButton as={Link} to={path}>
        {name}
      </StartExerciseButton>
      <p>{description}</p>
    </StyledExerciseCard>
  );
}
