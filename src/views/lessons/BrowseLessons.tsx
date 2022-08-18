import { DateTime, Duration } from "luxon";
import React, { ReactElement } from "react";
import { SectionHeading } from "../../components/SectionHeading";
import { StyledLink } from "../../components/StyledLink";
import { StyledTable } from "../../components/StyledTable";
import { VisuallyHidden } from "../../components/VisuallyHidden";
import { Lesson, nameForLesson } from "../../state/reducers/lessons";
import { useUserStateContext } from "../../state/UserStateProvider";

type FinishedLesson = Lesson & { startedAt: number; completedAt: number };

export function BrowseLessons(): ReactElement {
  const { lessons } = useUserStateContext();
  const finishedLessons = Object.values(lessons)
    .filter((l): l is FinishedLesson => Boolean(l.completedAt && l.startedAt))
    .sort((a, b) => a.completedAt - b.completedAt);
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
              <VisuallyHidden as="th">
                Link to view lesson details
              </VisuallyHidden>
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
          You have not completed any lessons. Head over to the dashboard to
          start learning!
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
        {Duration.fromMillis(lesson.completedAt - lesson.startedAt).toHuman()}
      </td>
      <td>
        <StyledLink to={`/lessons/${lesson.id}`}>Details</StyledLink>
      </td>
    </tr>
  );
}
