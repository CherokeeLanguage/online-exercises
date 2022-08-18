import React, { ReactElement } from "react";
import { ButtonLink } from "../../components/Button";
import { SectionHeading } from "../../components/SectionHeading";

export function LessonsWidget(): ReactElement {
  function createLessonPath(numChallenges: number, reviewOnly: boolean) {
    return `/lessons/new/${numChallenges}/${reviewOnly}`;
  }

  return (
    <div>
      <SectionHeading>Learn now - start a new lesson</SectionHeading>
      <p>You should try to do at least one lesson with new terms a day.</p>
      <div style={{ gap: "16px", display: "flex" }}>
        <ButtonLink to={createLessonPath(120, false)} variant="primary">
          15 minute lesson with new terms
        </ButtonLink>
        <ButtonLink to={createLessonPath(120, true)} variant="primary">
          15 minute review session
        </ButtonLink>
      </div>
    </div>
  );
}
