import React, { ReactElement } from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import { StyledAnchor } from "./components/StyledLink";

const SidebarWrapper = styled.div``;

const StyledNav = styled.nav`
  display: flex;
  gap: 16px;
  max-width: 800px;
  margin: auto;
  align-items: center;
`;

const StyledNavLink = styled(StyledAnchor)`
  flex: 1;
  &.active {
    background: #33a;
  }
`;

export function NavBar(): ReactElement {
  return (
    <SidebarWrapper>
      <StyledNav>
        <StyledNavLink as={NavLink} to={"/"}>
          Dashboard
        </StyledNavLink>
        <StyledNavLink as={NavLink} to={"/sets"}>
          Find vocab sets
        </StyledNavLink>
        <StyledNavLink as={NavLink} to={"/lessons"}>
          Today's lessons
        </StyledNavLink>
      </StyledNav>
    </SidebarWrapper>
  );
}
