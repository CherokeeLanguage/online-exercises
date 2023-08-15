import React, { ReactElement } from "react";
import { Duration } from "luxon";
import { SmallLoader } from "../../components/Loader";
import { SectionHeading } from "../../components/SectionHeading";
import { StyledLink } from "../../components/StyledLink";
import { StyledTable } from "../../components/StyledTable";
import { VisuallyHidden } from "../../components/VisuallyHidden";
import { useAuth } from "../../firebase/AuthProvider";
import {
  useAnalyticsPageName,
  useFirebaseAllLessonMetadata,
} from "../../firebase/hooks";
import { Lesson, nameForLesson } from "../../state/reducers/lessons";
import { ViewLessonPath } from "../../routing/paths";
import { HanehldaView } from "../../components/HanehldaView";
import { DefaultNav } from "../../components/HanehldaView/HanehldaNav";
import { Button, ButtonLink } from "../../components/Button";
import { Link } from "react-router-dom";

type FinishedLesson = Lesson & { completedAt: number };

export function LessonHistoryPage(): ReactElement {
  useAnalyticsPageName("Lesson archive");
  const { user } = useAuth();

  const [firebaseResult, _] = useFirebaseAllLessonMetadata(user);

  if (!firebaseResult.ready)
    return (
      <div style={{ width: "100%" }}>
        <SmallLoader below={"Loading lesson data..."} />
      </div>
    );

  const lessons = firebaseResult.data ?? {};

  const finishedLessons = Object.values(lessons)
    .filter((l): l is FinishedLesson => Boolean(l.completedAt))
    // most recent first
    .sort((a, b) => b.completedAt - a.completedAt);
  return (
    <HanehldaView navControls={<DefaultNav />} collapseNav>
      <div>
        <SectionHeading>Lessons archive</SectionHeading>
        <p>
          Here, you can review lessons you've already completed. This can help
          you know how long lessons of different sizes take for you to complete.
        </p>
        {finishedLessons.length ? (
          <StyledTable>
            <thead>
              <tr>
                <th>Date completed</th>
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
    </HanehldaView>
  );
}

function FinishedLessonRow({ lesson }: { lesson: FinishedLesson }) {
  return (
    <tr>
      <td>{new Date(lesson.createdFor).toDateString()}</td>
      <td>
        <Button
          as={Link}
          style={{ margin: "0 auto" }}
          to={ViewLessonPath(lesson.id)}
        >
          Details
        </Button>
      </td>
    </tr>
  );
}
