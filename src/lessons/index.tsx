import React, { ReactElement, useState } from "react";
import styled from "styled-components";
import { StyledLink } from "../components/StyledLink";
import { TermCardList } from "../components/TermCardList";
import { cards, keyForCard, termsByLesson } from "../data/clean-cll-data";
import { getTerms } from "../data/utils";
import { useLeitnerBoxContext } from "../utils/LeitnerBoxProvider";
import { useCardsForTerms } from "../utils/useCardsForTerms";
import { LeitnerBoxState, newTerm, TermStats } from "../utils/useLeitnerBoxes";

const StyledLessonList = styled.ul`
  padding: 0;
  margin: auto;
  max-width: 800px;
  list-style: none;
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
        {Object.keys(termsByLesson).map((lessonName, i) => {
          return <Lesson key={i} lessonName={lessonName} />;
        })}
      </StyledLessonList>
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

export function Lesson({ lessonName }: { lessonName: string }): ReactElement {
  const { state: leitnerBoxState } = useLeitnerBoxContext();
  const [showTerms, setShowTerms] = useState(false);
  const now = Date.now();
  const lessonTerms = getTerms(lessonName, false);
  const termCards = useCardsForTerms(cards, lessonTerms, keyForCard);

  const termsWithStats = Object.entries(termCards).map(([term, card]) => ({
    term,
    stats: leitnerBoxState.terms[term] ?? newTerm(term),
    card,
  }));

  return (
    <li>
      <StyledLessonHeader>
        <h2>{lessonName}</h2>
        <StyledLessonLinks>
          <StyledLink
            to={`/practice/lesson/${lessonName}/false`}
            disabled={termsToPractice(lessonTerms, leitnerBoxState, now) === 0}
          >
            New terms
          </StyledLink>
          <StyledLink
            to={`/practice/lesson/${lessonName}/true`}
            disabled={
              termsToPractice(
                getTerms(lessonName, true),
                leitnerBoxState,
                now
              ) === 0
            }
          >
            All material
          </StyledLink>
          <button onClick={() => setShowTerms(!showTerms)}>
            {showTerms ? "Hide terms" : `Show terms (${termsWithStats.length})`}
          </button>
        </StyledLessonLinks>
      </StyledLessonHeader>
      {showTerms && <TermCardList terms={termsWithStats} />}
    </li>
  );
}
