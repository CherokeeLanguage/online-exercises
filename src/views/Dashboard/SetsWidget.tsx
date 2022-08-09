import React, { ReactElement } from "react";
import { DashboardWidget } from "./DashboardWidget";
import { DashboardWidgetCard } from "./DashboardWidgetCard";
import {
  collections,
  CHEROKEE_LANGUAGE_LESSONS_COLLLECTION,
} from "../../data/sets";
import { useNavigate } from "react-router-dom";
import { DashboardWidgetCardAction } from "./DashboardWidgetCardAction";

export function SetsWidget(): ReactElement {
  const cll1 = collections[CHEROKEE_LANGUAGE_LESSONS_COLLLECTION];
  const navigate = useNavigate();
  return (
    <DashboardWidget title={cll1.title}>
      {cll1.sets.map((set, idx) => (
        <DashboardWidgetCard
          key={idx}
          title={set.title}
          action={
            <DashboardWidgetCardAction
              onClick={() => navigate(`sets/${set.id}`)}
            >
              view
            </DashboardWidgetCardAction>
          }
        >
          {set.terms.length} terms
        </DashboardWidgetCard>
      ))}
    </DashboardWidget>
  );
}
