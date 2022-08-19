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
import { StyledLink } from "../../components/StyledLink";
import { ButtonLink } from "../../components/Button";

export function SetsWidget(): ReactElement {
  const cll1 = collections[CHEROKEE_LANGUAGE_LESSONS_COLLLECTION];
  const { sets } = useUserStateContext();
  return (
    <DashboardWidget title={cll1.title}>
      {cll1.sets
        .filter((s) => !(s.id in sets))
        .map((set, idx) => (
          <DashboardWidgetCard
            key={idx}
            title={set.title}
            action={
              <StyledLink to={`sets/browse/${set.id}`}>View set</StyledLink>
            }
          >
            {set.terms.length} terms
          </DashboardWidgetCard>
        ))}
    </DashboardWidget>
  );
}
