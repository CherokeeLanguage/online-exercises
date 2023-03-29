import React, { ReactNode } from "react";
import styled from "styled-components";
import { IconType } from "react-icons";
import { theme } from "../theme";

const StyledIconButton = styled.button<{ highlightColor?: string }>`
  border: none;
  background: none;
  font-size: inherit;
  :hover {
    color: ${({ highlightColor }) => highlightColor ?? theme.colors.DARK_RED};
    text-decoration: underline;
  }
`;

/**
 * A cute little button with an icon and a label underneath.
 */
export function IconButton({
  Icon,
  onClick,
  children,
  color,
  ...buttonProps
}: {
  Icon: IconType;
  onClick: () => void;
  children?: ReactNode;
  color?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <StyledIconButton onClick={onClick} highlightColor={color} {...buttonProps}>
      <Icon
        style={{ display: "block", margin: "auto" }}
        size="2em"
        color={color}
      />
      {children}
    </StyledIconButton>
  );
}
