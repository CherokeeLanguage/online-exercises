import styled from "styled-components";
import { theme } from "../../theme";
import React, { ReactNode, ReactElement, useContext } from "react";
import { GrNext, GrPrevious } from "react-icons/gr";
import { wizardContext } from "./SetupWizard";

export const Hr = styled.hr`
  border: 0;
  border-bottom: 4px solid ${theme.hanehldaColors.DARK_RED};
  margin: 16px 30px;
`;

const StyledNavigation = styled.div`
  display: flex;
  padding: 15px;
  & > div {
    flex: 1;
    display: flex;
    &:first-child {
      text-align: left;
    }
    &:last-child {
      text-align: right;
      flex-direction: row-reverse;
    }
  }
`;

const NavigationButton = styled.button`
  color: black;
  outline: none;
  background-color: ${theme.colors.WHITE};
  border-radius: ${theme.borderRadii.md};
  border: "none";
  box-shadow: ${theme.boxShadow.light};
  padding: 10px;
  display: flex;
  align-self: flex-end;
  align-items: center;
`;

export function BackButton(): ReactElement {
  const { goBack } = useContext(wizardContext);
  return (
    <NavigationButton onClick={goBack} type="button">
      <GrPrevious />
      Back
    </NavigationButton>
  );
}

export function NextButton({
  children,
  type = "button",
  onClick,
  disabled = false,
}: {
  children: ReactNode;
  type?: "submit" | "button";
  onClick?: () => void;
  disabled?: boolean;
}): ReactElement {
  return (
    <NavigationButton onClick={onClick} type={type} disabled={disabled}>
      {children}
      <GrNext />
    </NavigationButton>
  );
}

export function NavigationButtons({
  left,
  right,
}: {
  left?: ReactNode;
  right?: ReactNode;
}): ReactElement {
  return (
    <StyledNavigation>
      <div>{left}</div>
      <div>{right}</div>
    </StyledNavigation>
  );
}
