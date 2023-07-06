import { ReactElement } from "react";
import styled from "styled-components";
import { devices, theme } from "../theme";

const StyledTitle = styled.h1`
  font-family: "Noto Sans Cherokee", "Noto Sans", sans-serif;
  text-align: center;
  color: ${theme.hanehldaColors.DARK_RED};
  -webkit-text-stroke: 10px ${theme.colors.WHITE};
  paint-order: stroke fill;
  margin: 0;
  font-size: 70px;
  @media ${devices.tablet} {
    font-size: 140px;
    line-height: 140px;
    margin-top: 20px;
  }
`;

export function Title(): ReactElement {
  return (
    <div>
      <StyledTitle>ᎭᏁᎵᏓ!</StyledTitle>
      <span>
        <em>Learn Cherokee by "trying"</em>
      </span>
    </div>
  );
}
