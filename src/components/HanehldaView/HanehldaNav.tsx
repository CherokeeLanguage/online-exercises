import { ReactNode } from "react";
import { NavLinkProps, NavLink as RouterNavLink } from "react-router-dom";
import styled from "styled-components";
import {
  DashboardPath,
  BrowseCollectionsPath,
  FindAWordPath,
  CommunityPath,
} from "../../routing/paths";
import { theme } from "../../theme";

const StyledNav = styled.nav`
  grid-area: nav;
  display: flex;
  justify-content: space-evenly;
`;

const NavRight = styled.div`
  text-align: right;
`;

export function Nav({
  children,
  right,
}: {
  children?: ReactNode;
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
  font-size: ${theme.fontSizes.md};
  display: block;
  position: relative;
  color: ${theme.colors.WHITE};
  padding: 4px;
  margin: 4px 0;
  text-decoration: none;
  font-weight: normal;
  font-weight: bold;
  &.active {
    color: ${theme.hanehldaColors.DARK_YELLOW};
    text-decoration: underline;
  }
`;

export function NavLink(
  props: NavLinkProps & React.RefAttributes<HTMLAnchorElement>
) {
  return <StyledNavLink as={RouterNavLink} {...props} />;
}

const NavDrawerBlackout = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background-color: rgba(0,0,0,0.35);
`;

const NavDrawerContainer = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  box-sizing: border-box;
  width: 100%;
  max-width: 225px;
  margin: 0;
  margin-left: auto;
  padding: 25px;
  background-color: ${theme.hanehldaColors.SIDEBAR};
  height: 100%;
  display: grid;
  grid-template-rows: 1fr auto;
  grid-template-areas:
    "nav"
    "right";
  nav {
    display: block;
  }
  a {
    margin: 12px 0;
    text-align: center;
  }
  div {
    text-align: center;
  }
`;

export function NavDrawer({
  children,
  closeDrawer,
}: {
  children?: ReactNode;
  closeDrawer: () => void;
}) {
  return (
    <>
      <NavDrawerBlackout onClick={closeDrawer} />
      <NavDrawerContainer>{children}</NavDrawerContainer>
    </>
  );
}

export function DefaultNav() {
  return (
    <Nav right={<NavLink to="/settings">Settings</NavLink>}>
      <NavLink to={DashboardPath}>Learn</NavLink>
      <NavLink to={BrowseCollectionsPath}>Courses</NavLink>
      <NavLink to={CommunityPath}>Community</NavLink>
      <NavLink to={FindAWordPath}>Find a word</NavLink>
    </Nav>
  );
}
