import React, { ReactElement } from "react";
import { StyledLink } from "../../components/StyledLink";
import {
  nameForLesson,
  useLessons,
} from "../../spaced-repetition/LessonsProvider";
import { DashboardWidget } from "./DashboardWidget";
import { DashboardWidgetCard } from "./DashboardWidgetCard";

export function LessonsWidget(): ReactElement {
  const { todaysLessons } = useLessons();

  const lessonsToDo = todaysLessons.filter(
    (l) => l.type === "DAILY" && l.completedAt === null
  );

  return (
    <DashboardWidget title="Today's lessons">
      {lessonsToDo.length ? (
        lessonsToDo.map((lesson, i) => (
          <DashboardWidgetCard
            key={i}
            title={nameForLesson(lesson)}
            action={
              <StyledLink to={`/practice/${lesson.id}`}>
                Practice now!
              </StyledLink>
            }
          >
            <p>{lesson.terms.length} terms</p>
          </DashboardWidgetCard>
        ))
      ) : (
        <p>
          No more lessons today - take a break or start learning a new set from
          below!
        </p>
      )}
    </DashboardWidget>
  );
}
