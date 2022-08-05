import { Link, LinkProps } from "react-router-dom";
import styled, { css } from "styled-components";

export interface StyledAnchorProps {
  disabled?: boolean;
}

export const StyledAnchor = styled.a<StyledAnchorProps>`
  border: 1px solid #333;
  border-radius: 8px;
  padding: 8px;
  margin: 0 8px;
  display: inline-block;
  color: white;
  background: #555;
  ${({ disabled }) =>
    disabled &&
    css`
      pointer-events: none;
      background: #888;
      color: black;
    `}
`;

export function StyledLink({
  disabled = false,
  ...linkProps
}: LinkProps & React.RefAttributes<HTMLAnchorElement> & StyledAnchorProps) {
  linkProps["aria-disabled"] = disabled;
  return <StyledAnchor as={Link} disabled={disabled} {...linkProps} />;
}
