import React, { ReactElement } from "react";
import styled from "styled-components";
import { StyledLink } from "../components/StyledLink";
import { termsByLesson } from "../data/clean-cll-data";

const StyledLessonList = styled.ul`
  padding: 0;
  margin: auto;
  max-width: 800px;
  list-style: none;
  li {
    padding: 8px 32px;
    margin-top: 32px;
    border-bottom: 1px solid #444;
    display: flex;
    justify-content: space-between;
    h2 {
      padding: 0;
      margin: 0;
      min-width: fit-content;
    }
  }
`;

const StyledLessonLinks = styled.div`
  gap: 8px;
`;

export function Lessons(): ReactElement {
  return (
    <div>
      <p>
        Here you can select lessons from the Cherokee Language Lessons book to
        review. These same terms are used in the audio exercises from the book.
      </p>
      <p>
        You may choose to review only new terms in a chapter, or all terms
        introduced before and within that chapter.
      </p>
      <StyledLessonList>
        {Object.keys(termsByLesson).map((chapters, i) => (
          <li key={i}>
            <h2>{chapters}</h2>
            <StyledLessonLinks>
              <StyledLink to={`/practice/lesson/${chapters}/false`}>
                New terms
              </StyledLink>
              <StyledLink to={`/practice/lesson/${chapters}/true`}>
                All material
              </StyledLink>
            </StyledLessonLinks>
          </li>
        ))}
      </StyledLessonList>
    </div>
  );
}
