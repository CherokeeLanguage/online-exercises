import React, { ReactElement } from "react";
import { DashboardWidget } from "./DashboardWidget";
import { DashboardWidgetCard } from "./DashboardWidgetCard";
import {
  collections,
  CHEROKEE_LANGUAGE_LESSONS_COLLLECTION,
} from "../../data/vocabSets";
import { useNavigate } from "react-router-dom";
import { DashboardWidgetCardAction } from "./DashboardWidgetCardAction";
import { useUserStateContext } from "../../state/UserStateProvider";

export function SetsWidget(): ReactElement {
  const cll1 = collections[CHEROKEE_LANGUAGE_LESSONS_COLLLECTION];
  const { sets } = useUserStateContext();
  const navigate = useNavigate();
  return (
    <DashboardWidget title={cll1.title}>
      {cll1.sets
        .filter((s) => !(s.id in sets))
        .map((set, idx) => (
          <DashboardWidgetCard
            key={idx}
            title={set.title}
            action={
              <DashboardWidgetCardAction
                onClick={() => navigate(`sets/browse/${set.id}`)}
              >
                View set
              </DashboardWidgetCardAction>
            }
          >
            {set.terms.length} terms
          </DashboardWidgetCard>
        ))}
    </DashboardWidget>
  );
}
