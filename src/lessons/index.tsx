import React, { ReactElement } from "react";
import styled from "styled-components";
import { StyledLink } from "../components/StyledLink";
import { termsByLesson } from "../data/clean-cll-data";
import { getTerms } from "../data/utils";
import { useLeitnerBoxContext } from "../utils/LeitnerBoxProvider";
import { LeitnerBoxState, TermStats } from "../utils/useLeitnerBoxes";

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

function termNeedsPractice(
  term: TermStats | undefined,
  epochNow: number
): boolean {
  if (!term) return true;
  else return term.nextShowTime < epochNow + 1000 * 60 * 60;
}

/**
 * Count how many terms from the lesson need to be practiced in the next hour
 */
function termsToPractice(
  terms: string[],
  leitnerBoxes: LeitnerBoxState,
  epochNow: number
) {
  return terms.reduce(
    (count, term) =>
      termNeedsPractice(leitnerBoxes.terms[term], epochNow) ? count + 1 : count,
    0
  );
}

export function Lessons(): ReactElement {
  const { state: leitnerBoxState } = useLeitnerBoxContext();
  const now = Date.now();
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
      <p>
        If a link to practice is disabled, you have already practiced those
        terms enough for today.
      </p>
      <StyledLessonList>
        {Object.keys(termsByLesson).map((chapters, i) => {
          return (
            <li key={i}>
              <h2>{chapters}</h2>
              <StyledLessonLinks>
                <StyledLink
                  to={`/practice/lesson/${chapters}/false`}
                  disabled={
                    termsToPractice(
                      getTerms(chapters, false),
                      leitnerBoxState,
                      now
                    ) === 0
                  }
                >
                  New terms
                </StyledLink>
                <StyledLink
                  to={`/practice/lesson/${chapters}/true`}
                  disabled={
                    termsToPractice(
                      getTerms(chapters, true),
                      leitnerBoxState,
                      now
                    ) === 0
                  }
                >
                  All material
                </StyledLink>
              </StyledLessonLinks>
            </li>
          );
        })}
      </StyledLessonList>
    </div>
  );
}
