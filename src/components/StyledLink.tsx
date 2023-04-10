import { Link, LinkProps } from "react-router-dom";
import styled, { css } from "styled-components";
import { theme } from "../theme";

export interface StyledAnchorProps {
  disabled?: boolean;
}

export const StyledAnchor = styled.a<StyledAnchorProps>`
  border-radius: 8px;
  cursor: pointer;
  display: inline-block;
  text-decoration: underline;
  color: ${theme.colors.DARK_RED};
  ${({ disabled }) =>
    disabled &&
    css`
      pointer-events: none;
      background: #888;
      color: black;
    `};
`;

export function StyledLink({
  disabled = false,
  ...linkProps
}: LinkProps & React.RefAttributes<HTMLAnchorElement> & StyledAnchorProps) {
  linkProps["aria-disabled"] = disabled;
  return <StyledAnchor as={Link} disabled={disabled} {...linkProps} />;
}
