import React, { ReactElement } from "react";
import { Button, ButtonLink } from "../../components/Button";
import { nameForLesson } from "../../state/reducers/lessons";
import { useUserStateContext } from "../../state/UserStateProvider";
import { DashboardWidget } from "./DashboardWidget";
import { DashboardWidgetCard } from "./DashboardWidgetCard";

export function LessonsWidget(): ReactElement {
  const { todaysLessons, refreshDailyLessons } = useUserStateContext();

  const lessonsToDo = todaysLessons.filter(
    (l) => l.type === "DAILY" && l.completedAt === null
  );

  return (
    <DashboardWidget
      title={
        <>
          Today's lessons{" "}
          <Button onClick={refreshDailyLessons} variant="primary">
            Refresh lessons
          </Button>
        </>
      }
    >
      {lessonsToDo.length ? (
        lessonsToDo.map((lesson, i) => (
          <DashboardWidgetCard
            key={i}
            title={nameForLesson(lesson)}
            action={
              <ButtonLink to={`/practice/${lesson.id}`} variant="primary">
                Practice now!
              </ButtonLink>
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
