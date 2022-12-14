import { DateTime, Duration } from "luxon";
import React, { ReactElement } from "react";
import { SectionHeading } from "../../components/SectionHeading";
import { StyledLink } from "../../components/StyledLink";
import { StyledTable } from "../../components/StyledTable";
import { VisuallyHidden } from "../../components/VisuallyHidden";
import { Lesson, nameForLesson } from "../../state/reducers/lessons";
import { useUserStateContext } from "../../state/UserStateProvider";

type FinishedLesson = Lesson & { startedAt: number; completedAt: number };

export function LessonArchive(): ReactElement {
  const { lessons } = useUserStateContext();
  const finishedLessons = Object.values(lessons)
    .filter((l): l is FinishedLesson => Boolean(l.completedAt && l.startedAt))
    // most recent first
    .sort((a, b) => b.completedAt - a.completedAt);
  return (
    <div>
      <SectionHeading>Lessons archive</SectionHeading>
      <p>
        Here, you can review lessons you've already completed. This can help you
        know how long lessons of different sizes take for you to complete.
      </p>
      {finishedLessons.length ? (
        <StyledTable>
          <thead>
            <tr>
              <th>Name</th>
              <th>Number of challenges</th>
              <th>Duration</th>
              <th>
                <VisuallyHidden>Link to view lesson details</VisuallyHidden>
              </th>
            </tr>
          </thead>
          <tbody>
            {finishedLessons.map((lesson, idx) => (
              <FinishedLessonRow key={idx} lesson={lesson} />
            ))}
          </tbody>
        </StyledTable>
      ) : (
        <p>
          You have not completed any lessons. Head over to the{" "}
          <StyledLink to="/">dashboard</StyledLink> to start learning!
        </p>
      )}
    </div>
  );
}

function FinishedLessonRow({ lesson }: { lesson: FinishedLesson }) {
  return (
    <tr>
      <td>{nameForLesson(lesson)}</td>
      <td>{lesson.numChallenges || "Unknown number of challenges"}</td>
      <td>
        {Duration.fromObject({
          milliseconds: lesson.completedAt - lesson.startedAt,
        })
          .shiftTo("minutes", "seconds", "milliseconds")
          .mapUnits((x, u) => (u === "milliseconds" ? 0 : x))
          .shiftTo("minutes", "seconds")
          .toHuman()}
      </td>
      <td>
        <StyledLink to={`/lessons/${lesson.id}`}>Details</StyledLink>
      </td>
    </tr>
  );
}
