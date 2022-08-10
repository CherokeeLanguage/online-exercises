import React, { ReactElement } from "react";
import { StyledAnchor, StyledLink } from "../../components/StyledLink";
import {
  nameForLesson,
  useLessons,
} from "../../spaced-repetition/LessonsProvider";

export function BrowseLessons(): ReactElement {
  const { lessons, todaysLessons } = useLessons();
  return (
    <div>
      <h2>Browse Lessons</h2>
      <div>
        <h3>Today's lessons</h3>
        <div>
          {todaysLessons.length ? (
            todaysLessons
              .filter((lesson) => lesson.completedAt === null)
              .map((l, i) => (
                <p key={i}>
                  {nameForLesson(l)} - {l.terms.length} terms
                  <StyledLink to={`/practice/${l.id}`}>Continue</StyledLink>
                </p>
              ))
          ) : (
            <p>
              No more lessons today. Think about adding a new vocab set to your
              rotation!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
