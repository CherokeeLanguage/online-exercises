import React, { ReactElement } from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import { theme } from "./theme";

const SidebarWrapper = styled.div`
  flex: 0 1 265px;
  text-align: left;
  border-right: 2px solid ${theme.colors.HARD_YELLOW};
  background: ${theme.colors.LIGHT_GRAY};
`;

const StyledNav = styled.nav`
  gap: 16px;
  margin: auto;
  align-items: center;
`;

const StyledNavLink = styled.a`
  display: block;
  position: relative;
  color: ${theme.colors.TEXT_GRAY};
  padding: 0 8px;
  margin: 4px 0;
  text-decoration: none;
  &.active {
    color: ${theme.colors.DARK_RED};
    &:before {
      content: "";
      background: ${theme.colors.DARK_RED};
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      width: 4px;
      height: 100%;
    }
  }
`;

const StyledHeading = styled.h1`
  font-weight: bold;
  font-size: 24px;
  margin: 0;
  padding: 8px;
`;

export function SideBar(): ReactElement {
  return (
    <SidebarWrapper>
      <StyledHeading>Cherokee Language Exercises</StyledHeading>
      <StyledNav>
        <StyledNavLink as={NavLink} to={"/"}>
          Dashboard
        </StyledNavLink>
        <StyledNavLink as={NavLink} to={"/sets/my"}>
          Your sets
        </StyledNavLink>
        <StyledNavLink as={NavLink} to={"/sets/browse"}>
          Find new vocabulary
        </StyledNavLink>
        {/* <StyledNavLink as={NavLink} to={"/lessons"}>
          Today's lessons
        </StyledNavLink> */}
      </StyledNav>
    </SidebarWrapper>
  );
}
