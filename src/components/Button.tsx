import React, { ReactNode } from "react";
import { Link } from "react-router-dom";
import styled, { css } from "styled-components";
import { theme } from "../theme";
import { styledWithDefault } from "../utils/styledWithDefault";

export type ButtonVariant = "primary" | "negative";

interface RequiredButtonProps {}

interface OptionalButtonProps {
  variant: ButtonVariant;
}

type ButtonPropsWithDefaults = RequiredButtonProps &
  Required<OptionalButtonProps>;

export type ButtonProps = RequiredButtonProps & Partial<OptionalButtonProps>;

export const Button = styledWithDefault(
  styled.button<ButtonPropsWithDefaults>`
    box-sizing: border-box;
    display: inline-block;
    text-decoration: none;
    border: none;
    border-radius: ${theme.borderRadii.md};
    padding: 5px 20px;
    font-weight: bold;
    margin: 8px auto;
    font-size: ${theme.fontSizes.sm};
    cursor: pointer;
    box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    ${({ variant }) =>
      variant === "primary" &&
      css`
        background-color: ${theme.colors.WHITE};
        color: ${theme.hanehldaColors.DARK_GRAY};
        border: 1px solid black;
        &:hover {
          border: 1px solid black;
        }
        &:disabled {
          background: ${theme.colors.MED_GRAY};

          &:hover {
            border: 1px solid ${theme.colors.MED_GRAY};
          }
        }
      `}

    ${({ variant }) =>
      variant === "negative" &&
      css`
        background: ${theme.hanehldaColors.DARK_RED};
        color: white;
        border: 1px solid black;
        &:hover {
          border: 1px solid black;
        }
      `}

    &:disabled {
      background: ${theme.colors.MED_GRAY};
      color: ${theme.colors.TEXT_GRAY};
      border: 1px solid ${theme.colors.MED_GRAY};
      cursor: not-allowed;
      &:hover {
        border: 1px solid ${theme.colors.MED_GRAY};
      }
    }
  `,
  {
    variant: "primary",
  } as ButtonProps
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
