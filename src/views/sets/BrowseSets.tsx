import React, { ReactElement } from "react";
import styled from "styled-components";
import { StyledLink } from "../../components/StyledLink";
import { useLeitnerBoxContext } from "../../spaced-repetition/LeitnerBoxProvider";
import { LeitnerBoxState } from "../../spaced-repetition/useLeitnerBoxes";
import { getToday } from "../../utils/dateUtils";
import { termNeedsPractice } from "../../spaced-repetition/groupTermsIntoLessons";
import { collections, Set } from "../../data/sets";

const StyledSetList = styled.ul`
  padding: 0;
  margin: auto;
  max-width: 800px;
  list-style: none;
`;

const StyledSetLinks = styled.div`
  gap: 8px;
`;

/**
 * Count how many terms from the lesson need to be practiced in the next hour
 */
function termsToPractice(
  terms: string[],
  leitnerBoxes: LeitnerBoxState,
  today: number
) {
  return terms.reduce(
    (count, term) =>
      termNeedsPractice(leitnerBoxes.terms[term], today) ? count + 1 : count,
    0
  );
}

export function BrowseSets(): ReactElement {
  return (
    <div>
      <p>
        You may choose to review only new terms in a chapter, or all terms
        introduced before and within that chapter.
      </p>
      <p>
        If a link to practice is disabled, you have already practiced those
        terms enough for today.
      </p>
      {Object.values(collections).map((collection) => (
        <div>
          <h2>{collection.title}</h2>

          <StyledSetList>
            {collection.sets.map((set, i) => {
              return <VocabSet key={i} set={set} />;
            })}
          </StyledSetList>
        </div>
      ))}
    </div>
  );
}

const StyledLessonHeader = styled.div`
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
`;

export function VocabSet({ set }: { set: Set }): ReactElement {
  const { state: leitnerBoxState } = useLeitnerBoxContext();
  const today = getToday();

  return (
    <li>
      <StyledLessonHeader>
        <h2>{set.title}</h2>
        <StyledSetLinks>
          <StyledLink to={`/sets/${set.id}`}>View terms</StyledLink>
          <StyledLink
            to={`/set/${set.id}/lessons`}
            disabled={termsToPractice(set.terms, leitnerBoxState, today) === 0}
          >
            Practice set
          </StyledLink>
        </StyledSetLinks>
      </StyledLessonHeader>
    </li>
  );
}
