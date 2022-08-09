import React, { ReactElement } from "react";
import { useLessons } from "../../spaced-repetition/LessonsProvider";
import { getToday } from "../../utils/dateUtils";
import { DashboardWidget } from "./DashboardWidget";
import { DashboardWidgetCard } from "./DashboardWidgetCard";

export function LessonsWidget(): ReactElement {
  const { todaysLessons } = useLessons();

  return (
    <DashboardWidget title="Today's lessons">
      {todaysLessons.length ? (
        todaysLessons.map((id) => (
          <DashboardWidgetCard title={`Lesson ${id}`}>
            <p>60000 cards</p>
          </DashboardWidgetCard>
        ))
      ) : (
        <DashboardWidgetCard title="Ooop come back">
          <p>No lessons today</p>
        </DashboardWidgetCard>
      )}
    </DashboardWidget>
  );
}
