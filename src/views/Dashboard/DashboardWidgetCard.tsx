import { ReactElement, ReactNode } from "react";
import styled from "styled-components";

export interface DashboardWidgetCardProps {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}

const Card = styled.div`
  min-width: 200px;
  min-height: 150px;
  box-shadow: 2px 2px 4px #aaa;
  border: 1px solid #aaa;
  border-radius: 8px;
  background: #fff;
`;

const CardContent = styled.div``;

export function DashboardWidgetCard({
  title,
  children,
  action,
}: DashboardWidgetCardProps): ReactElement {
  return (
    <Card>
      <h3>{title}</h3>
      <CardContent>{children}</CardContent>
      {action}
    </Card>
  );
}
