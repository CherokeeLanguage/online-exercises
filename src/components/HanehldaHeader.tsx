import { ReactElement, ReactNode } from "react";
import styled from "styled-components";
import { theme } from "../theme";

const StyledHeader = styled.header`
  display: flex;
  height: min-content;
  padding: 8px;
  background-color: ${theme.hanehldaColors.LIGHT_GRAY};
  color: ${theme.hanehldaColors.DARK_GRAY};
  font-weight: 700;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
  h1 {
    flex: 0;
    margin: 0;
    font-size: 35px;
    color: ${theme.colors.WHITE};
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
