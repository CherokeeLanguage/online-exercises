import React, { ReactElement, ReactNode } from "react";
import styled from "styled-components";
import { SectionHeading } from "../../components/SectionHeading";

const StyledDashboardWidget = styled.div`
  margin-bottom: 20px;
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
      <SectionHeading>{title}</SectionHeading>
      {children}
    </StyledDashboardWidget>
  );
}
