import React, { ReactElement } from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import { StyledAnchor } from "./components/StyledLink";

import { routes } from "./routes";

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

export function Sidebar(): ReactElement {
  return (
    <SidebarWrapper>
      <StyledNav>
        <StyledNavLink as={NavLink} to={"/"}>
          Find lessons
        </StyledNavLink>
        <StyledNavLink as={NavLink} to={"/overview"}>
          Review your progress
        </StyledNavLink>
        <StyledNavLink as={NavLink} to={"/similar-terms"}>
          Practice now
        </StyledNavLink>
      </StyledNav>
    </SidebarWrapper>
  );
}
