import { ReactElement } from "react";
import styled from "styled-components";
import { theme } from "../theme";

const StyledTitle = styled.h1`
  font-family: "Noto Sans Cherokee", "Noto Sans", sans-serif;
  text-align: center;
  font-size: 140px;
  color: ${theme.hanehldaColors.DARK_RED};
  -webkit-text-stroke: 10px ${theme.colors.WHITE};
  paint-order: stroke fill;
  margin: 20px 0;
`;

export function Title(): ReactElement {
  return <StyledTitle>ᎭᏁᎵᏓ!</StyledTitle>;
}
