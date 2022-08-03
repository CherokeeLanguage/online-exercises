import React, { ReactElement } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

import { routes } from "./routes";

const SidebarWrapper = styled.div``;

const StyledNav = styled.nav`
  display: flex;
  gap: 16px;
  max-width: 600px;
  margin: auto;
  align-items: center;
`;

const StyledLink = styled.a`
  border: 1px solid #333;
  flex: 1;
  border-radius: 8px;
`;

export function Sidebar(): ReactElement {
  return (
    <SidebarWrapper>
      <StyledNav>
        <StyledLink as={Link} to={"/"}>
          Find lessons
        </StyledLink>
        <StyledLink as={Link} to={"/overview"}>
          Review your progress
        </StyledLink>
        <StyledLink as={Link} to={"/similar-terms"}>
          Practice now
        </StyledLink>
      </StyledNav>
    </SidebarWrapper>
  );
}
