import React, { ReactElement } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

import { routes } from "./routes";

const SidebarWrapper = styled.div`
  flex: 200px 0 1;
  border-right: 1px solid #111;
`;

export function Sidebar(): ReactElement {
  return (
    <SidebarWrapper>
      <nav>
        {routes.map((route, i) => (
          <Link key={i} to={route.path}>
            {route.path}
          </Link>
        ))}
      </nav>
    </SidebarWrapper>
  );
}
