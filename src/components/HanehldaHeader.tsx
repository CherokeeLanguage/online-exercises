import { ReactElement, ReactNode } from "react";
import styled from "styled-components";
import { theme } from "../theme";
import {
  NavLink as RouterNavLink,
  LinkProps,
  NavLinkProps,
} from "react-router-dom";

const StyledHeader = styled.header`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  grid-template-areas: "header nav right";
  height: min-content;
  padding: 8px;
  background-color: ${theme.hanehldaColors.LIGHT_GRAY};
  color: ${theme.hanehldaColors.DARK_GRAY};
  font-weight: 700;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
  h1 {
    flex: 0;
    margin: 0;
    font-size: 35px;
    color: ${theme.colors.WHITE};
    grid-area: header;
  }
  align-items: center;
`;

export function HanehldaHeader({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return (
    <StyledHeader>
      <h1>ᎭᏁᎵᏓ!</h1>
      {children}
    </StyledHeader>
  );
}

export const HeaderLabel = styled.h2`
  font-size: 20px;
  font-family: "Noto Sans", sans-serif;
  color: ${theme.colors.WHITE};
  margin: 0;
  grid-area: right;
  text-align: right;
`;

const StyledNav = styled.nav`
  grid-area: nav;
  justify-content: space-evenly;
`;
const NavRight = styled.div`
  text-align: right;
`;

export function Nav({
  children,
  right,
}: {
  children: ReactNode;
  right?: ReactNode;
}) {
  return (
    <>
      <StyledNav>{children}</StyledNav>
      <NavRight>{right}</NavRight>
    </>
  );
}

const StyledNavLink = styled.a`
  display: block;
  position: relative;
  color: ${theme.colors.WHITE};
  padding: 4px;
  margin: 4px 0;
  text-decoration: none;
  &.active {
    color: ${theme.colors.DARK_RED};
    &:before {
      content: "";
      background: ${theme.colors.DARK_RED};
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 4px;
      border-radius: 0 0 8px 8px;
    }
  }
`;

export function NavLink(
  props: NavLinkProps & React.RefAttributes<HTMLAnchorElement>
) {
  return <StyledNavLink as={RouterNavLink} {...props} />;
}
