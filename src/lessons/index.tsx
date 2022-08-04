import React, { ReactElement } from "react";
import { Link } from "react-router-dom";
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
    <StyledLessonList>
      {Object.keys(termsByLesson).map((chapters, i) => (
        <li key={i}>
          <h2>{chapters}</h2>
          <StyledLessonLinks>
            <StyledLink to={`/similar-terms/${chapters}/false`}>
              Learn new terms
            </StyledLink>
            <StyledLink to={`/similar-terms/${chapters}/true`}>
              Review
            </StyledLink>
          </StyledLessonLinks>
        </li>
      ))}
    </StyledLessonList>
  );
}
