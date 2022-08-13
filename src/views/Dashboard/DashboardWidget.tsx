import React, { ReactElement, ReactNode } from "react";
import styled from "styled-components";

const StyledDashboardWidget = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
`;

const WidgetScrollSection = styled.div`
  overflow-x: auto;
`;

const CardContainer = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: nowrap;
  padding: 8px;
`;

export interface DashboardWidgetProps {
  title: ReactNode;
  children: ReactNode;
}

export function DashboardWidget({
  title,
  children,
}: DashboardWidgetProps): ReactElement {
  return (
    <StyledDashboardWidget>
      <h2>{title}</h2>
      <WidgetScrollSection>
        <CardContainer>{children}</CardContainer>
      </WidgetScrollSection>
    </StyledDashboardWidget>
  );
}
