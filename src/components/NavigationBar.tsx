import React, { ReactElement } from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import { theme } from "../theme";

const NavbarWrapper = styled.div`
  text-align: left;
  border-bottom: 2px solid ${theme.colors.HARD_YELLOW};
  background: ${theme.colors.LIGHTER_GRAY};
  display: grid;
  grid-template-columns: 1fr auto 1fr;
`;

const StyledNav = styled.nav`
  gap: 16px;
  margin: auto;
  align-items: center;
  display: flex;
`;

const StyledNavLink = styled.a`
  display: block;
  position: relative;
  color: ${theme.colors.TEXT_GRAY};
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

const StyledHeading = styled.h1`
  font-weight: bold;
  font-size: ${theme.fontSizes.lg};
  margin: 0;
  padding: 4px;
`;

export function NavigationBar(): ReactElement {
  return (
    <NavbarWrapper>
      <StyledHeading>Cherokee Language Exercises</StyledHeading>
      <StyledNav>
        <StyledNavLink as={NavLink} to={"/"}>
          Dashboard
        </StyledNavLink>
        <StyledNavLink as={NavLink} to={"/sets/browse"}>
          Find new vocabulary
        </StyledNavLink>
        <StyledNavLink as={NavLink} to={"/sets/my"}>
          Your sets
        </StyledNavLink>
        <StyledNavLink as={NavLink} to={"/lessons"}>
          Lesson archive
        </StyledNavLink>
      </StyledNav>
      <div></div>
    </NavbarWrapper>
  );
}
