import React, { ReactElement, useState } from "react";
import { NavLink } from "react-router-dom";
import { useMedia } from "react-use";
import styled, { css } from "styled-components";
import { theme } from "../theme";
import { ModalBackground } from "./Modal";

const NavbarWrapper = styled.div<{ menuOpen: boolean }>`
  text-align: left;
  border-bottom: 2px solid ${theme.colors.HARD_YELLOW};
  background: ${theme.colors.LIGHTER_GRAY};
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  @media screen and (max-width: 800px) {
    ${({ menuOpen }) =>
      menuOpen
        ? css`
            border-bottom: 0px solid ${theme.colors.HARD_YELLOW};
            border-right: 2px solid ${theme.colors.HARD_YELLOW};
            grid-template-columns: 1fr;
            grid-template-rows: auto auto 1fr;
            height: 100vh;
            min-width: 300px;
            position: absolute;
            top: 0;
            left: 0;
            background: ${theme.colors.WHITE};
          `
        : css`
            grid-template-columns: 1fr 1fr auto;
          `}
  }
`;

const StyledNav = styled.nav<{ menuOpen: boolean }>`
  gap: 16px;
  margin: auto;
  align-items: center;
  display: flex;

  @media screen and (max-width: 800px) {
    ${({ menuOpen }) =>
      menuOpen &&
      css`
        flex-direction: column;
      `}
  }
`;

const StyledNavLink = styled.a<{ menuOpen: boolean }>`
  display: block;
  position: relative;
  color: ${theme.colors.TEXT_GRAY};
  padding: 4px;
  margin: 4px 0;
  text-decoration: none;

  @media screen and (max-width: 800px) {
    // if the menu is collapsed on mobile, only show the active link
    ${({ menuOpen }) =>
      !menuOpen &&
      css`
        display: none;
        &.active {
          display: block;
        }
      `}
  }

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

const AdvancedSettings = styled.div`
  flex-direction: row-reverse;
  align-items: center;
  display: flex;
  padding-right: 4px;
`;

const links = [
  {
    to: "/",
    text: "Dashboard",
  },
  {
    to: "/vocabulary",
    text: "Find new vocabulary",
  },
  {
    to: "/my-sets/",
    text: "Your sets",
  },
  {
    to: "/terms/",
    text: "Your terms",
  },
  {
    to: "/lessons/",
    text: "Lesson history",
  },
  {
    to: "/settings/",
    text: "Settings",
  },
];

export function NavigationBar(): ReactElement {
  // is the nav menu open on mobile?
  const [_menuOpen, setMenuOpen] = useState(false);
  const isMobile = useMedia("screen and (max-width: 800px)");
  const menuOpen = isMobile && _menuOpen;

  return (
    <>
      {menuOpen && <ModalBackground onClick={() => setMenuOpen(false)} />}
      <NavbarWrapper menuOpen={menuOpen}>
        <StyledHeading onClick={() => setMenuOpen(true)}>
          Cherokee Language Exercises
        </StyledHeading>
        <StyledNav
          menuOpen={menuOpen}
          onClick={(e) =>
            e.target instanceof HTMLAnchorElement && setMenuOpen(false)
          }
        >
          {links.map(({ to, text }) => (
            <StyledNavLink as={NavLink} to={to} menuOpen={menuOpen}>
              {text}
            </StyledNavLink>
          ))}
        </StyledNav>
      </NavbarWrapper>
    </>
  );
}
