import { ReactNode } from "react";
import { Link } from "react-router-dom";
import styled, { css } from "styled-components";
import { theme } from "../theme";

type ButtonVariant = "primary";

interface ButtonProps {
  variant: ButtonVariant;
}

export const Button = styled.button<ButtonProps>`
  border-radius: 8px;
  padding: 8px;
  text-decoration: none;
  font-size: ${theme.fontSizes.md};
  display: inline-block;
  cursor: pointer;
  ${({ variant }) =>
    variant === "primary" &&
    css`
      background: ${theme.colors.HARD_YELLOW};
      color: ${theme.colors.TEXT_GRAY};
      border: 1px solid ${theme.colors.MED_GRAY};
      &:hover {
        border: 1px solid ${theme.colors.TEXT_GRAY};
      }
    `}
`;

export function ButtonLink({
  children,
  variant,
  to,
}: {
  children?: ReactNode;
  variant: ButtonVariant;
  to: string;
}) {
  return (
    <Button as={Link} to={to} variant={variant}>
      {children}
    </Button>
  );
}
