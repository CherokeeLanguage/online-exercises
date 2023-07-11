import { ReactElement, ReactNode } from "react";
import styled from "styled-components";
import { theme } from "../theme";

const StyledHeader = styled.header`
  display: flex;
  height: min-content;
  padding: 8px;
  background-color: ${theme.hanehldaColors.LIGHT_RED};
  border-bottom: 4px solid ${theme.hanehldaColors.DARK_RED};
  color: ${theme.hanehldaColors.DARK_GRAY};
  font-weight: 700;
  h1 {
    flex: 0;
    margin: 0;
    font-size: 35px;
    color: ${theme.hanehldaColors.DARK_RED};
  }
  align-items: center;
`;

export function HanehldaHeader({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return (
    <StyledHeader>
      <h1>ᎭᏁᎵᏓ!</h1>
      {children}
    </StyledHeader>
  );
}
