import React, { ReactElement } from "react";
import { StyledLink } from "../../components/StyledLink";
import { nameForLesson } from "../../state/reducers/lessons";
import { useUserStateContext } from "../../state/UserStateProvider";

export function BrowseLessons(): ReactElement {
  const { todaysLessons } = useUserStateContext();
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
