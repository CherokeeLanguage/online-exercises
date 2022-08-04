import { Link, LinkProps } from "react-router-dom";
import styled from "styled-components";

export const StyledAnchor = styled.a`
  border: 1px solid #333;
  border-radius: 8px;
  padding: 8px;
  margin: 0 8px;
  display: inline-block;
  color: white;
  background: #555;
`;

export function StyledLink(
  props: LinkProps & React.RefAttributes<HTMLAnchorElement>
) {
  return <StyledAnchor as={Link} {...props} />;
}
