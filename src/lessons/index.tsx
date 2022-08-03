import React, { ReactElement } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { termsByLesson } from "../data/clean-cll-data";

const StyledLessonList = styled.ul`
  padding: 0;
  margin: 8px;
  list-style: none;
  li {
    padding: 8px 32px;
    margin-top: 32px;
    border-bottom: 1px solid #444;
  }
`;

const StyledLessonLinks = styled.div`
  display: flex;
  a {
    flex: 1;
  }
`;

export function Lessons(): ReactElement {
  return (
    <StyledLessonList>
      {Object.keys(termsByLesson).map((chapters, i) => (
        <li key={i}>
          <h2>{chapters}</h2>
          <StyledLessonLinks>
            <Link to={`/similar-terms/${chapters}/false`}>
              Review new terms for section
            </Link>
            <Link to={`/similar-terms/${chapters}/true`}>
              Review all terms up to section
            </Link>
          </StyledLessonLinks>
        </li>
      ))}
    </StyledLessonList>
  );
}
