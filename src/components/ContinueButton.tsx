import { ReactElement } from "react";
import { GrNext } from "react-icons/gr";
import styled from "styled-components";
import { useAnswersWithFeedback } from "./AnswersWithFeedback";
import { IconButton } from "./IconButton";

const StyledContinue = styled.div`
  text-align: center;
  margin-top: 20px;
`;

export function ContinueButton(): ReactElement {
  const { endFeedback } = useAnswersWithFeedback();
  return (
    <StyledContinue>
      <IconButton onClick={endFeedback} Icon={GrNext}>
        Continue
      </IconButton>
    </StyledContinue>
  );
}
