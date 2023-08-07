import { ReactElement, ReactNode } from "react";
import { theme } from "../theme";
import styled from "styled-components";

const Action = styled.div`
  display: flex;
  align-items: center;
  flex: 0 1 fit-content;
  padding: 16px;
  font-size: ${theme.fontSizes.sm};
  text-align: center;
  justify-content: space-around;
  margin: 0 auto;
`;

const StyledActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  /* @media screen and (max-width: 400px) {
    flex-direction: column;
  } */
`;

const Content = styled.div`
  display: flex;
  align-items: center;
  flex: 1 max-content;
`;

/**
 * A flex row with left-aligned content and an action at right. Eg. Cherokee/English with a "Listen Again" button.
 */
export function ActionRow({
  children,
  action,
}: {
  children: ReactNode;
  action: ReactNode;
}) {
  return (
    <StyledActionRow>
      <Content>{children}</Content>
      <Action>{action}</Action>
    </StyledActionRow>
  );
}
