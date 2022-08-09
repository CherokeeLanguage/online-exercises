import React, { ReactElement, ReactNode } from "react";
import styled from "styled-components";
import { StyledAnchor, StyledLink } from "../../components/StyledLink";

export interface DashboardWidgetCardActionProps {
  children: ReactNode;
  onClick: () => void;
}

export function DashboardWidgetCardAction({
  children,
  onClick,
}: DashboardWidgetCardActionProps): ReactElement {
  return (
    <StyledAnchor as={"button"} onClick={onClick}>
      {children}
    </StyledAnchor>
  );
}
