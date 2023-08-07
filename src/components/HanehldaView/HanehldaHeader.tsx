import { ReactElement, ReactNode } from "react";
import styled from "styled-components";
import { theme } from "../../theme";

const StyledHeader = styled.header`
  display: grid;
  grid-template-columns: 150px 1fr 150px;
  grid-template-areas: "header nav right";
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
    float: left;
    /* grid-area: header; */
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

export const HeaderLabel = styled.h2`
  font-size: 20px;
  font-family: "Noto Sans", sans-serif;
  color: ${theme.colors.WHITE};
  margin: 0;
  grid-area: right;
  text-align: right;
`;
