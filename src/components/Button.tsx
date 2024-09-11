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
    border-radius: ${theme.borderRadii.md};
    border: "none";
    box-shadow: ${theme.boxShadow.light};
    padding: 5px 20px;
    font-weight: bold;
    margin: 8px auto;
    font-size: ${theme.fontSizes.sm};
    cursor: pointer;
    ${({ variant }) =>
      variant === "primary" &&
      css`
        background-color: ${theme.hanehldaColors.WHITE_BUTTON};
        color: ${theme.hanehldaColors.DARK_GRAY};
        border-radius: ${theme.borderRadii.md};
        border: "none";
        box-shadow: ${theme.boxShadow.light};
        &:hover {
          background-color: ${theme.hanehldaColors.WHITE_HIGHLIGHT};
        }
        &:disabled {
          background: ${theme.colors.MED_GRAY};

          &:hover {
            background-color: ${theme.hanehldaColors.GRAY_HIGHLIGHT};
          }
        }
      `}

    ${({ variant }) =>
      variant === "negative" &&
      css`
        background: ${theme.hanehldaColors.DARK_RED};
        color: white;
        border-radius: ${theme.borderRadii.md};
        border: "none";
        box-shadow: ${theme.boxShadow.light};
        &:hover {
          background-color: ${theme.hanehldaColors.DARK_RED_HIGHLIGHT};
        }
      `}

    &:disabled {
      background: ${theme.colors.MED_GRAY};
      color: ${theme.colors.TEXT_GRAY};
      border-radius: ${theme.borderRadii.md};
      border: "none";
      box-shadow: ${theme.boxShadow.light};
      cursor: not-allowed;
      &:hover {
        background-color: ${theme.hanehldaColors.GRAY_HIGHLIGHT};
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
