import React, { Component, HTMLProps, ReactElement, ReactNode } from "react";
import { Link } from "react-router-dom";
import styled, {
  css,
  IntrinsicElementsKeys,
  StyledComponent,
} from "styled-components";
import { theme } from "../theme";
import { styledWithDefault } from "../utils/styledWithDefault";

type ButtonVariant = "primary";

interface RequiredButtonProps {}

interface OptionalButtonProps {
  variant: ButtonVariant;
}

type ButtonPropsWithDefaults = RequiredButtonProps &
  Required<OptionalButtonProps>;

export type ButtonProps = RequiredButtonProps & Partial<OptionalButtonProps>;

export const Button = styledWithDefault(
  styled.button<ButtonPropsWithDefaults>`
    border-radius: 8px;
    padding: 8px;
    text-decoration: none;
    font-size: ${theme.fontSizes.sm};
    display: inline-block;
    cursor: pointer;
    box-shadow: 1px 1px 6px ${theme.colors.MED_GRAY};
    ${({ variant }) =>
      variant === "primary" &&
      css`
        background: ${theme.colors.HARD_YELLOW};
        color: ${theme.colors.TEXT_GRAY};
        border: 1px solid ${theme.colors.MED_GRAY};
        &:hover {
          border: 1px solid ${theme.colors.TEXT_GRAY};
        }
        &:disabled{
          background: ${theme.colors.MED_GRAY};

          &:hover {
            border: 1px solid ${theme.colors.MED_GRAY};
          }
        }
      `}
  `,
  {
    variant: "primary",
  }
);

export function ButtonLink({
  children,
  to,
  ...rest
}: {
  children?: ReactNode;
  to: string;
} & ButtonProps) {
  return (
    <Button as={Link} to={to} {...rest}>
      {children}
    </Button>
  );
}
