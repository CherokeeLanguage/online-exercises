import styled from "styled-components";
import { Card } from "../data/clean-cll-data";
import { TermCardWithStats } from "../utils/useLeitnerReviewSession";

const StyledTermList = styled.ul`
  list-style: none;
  margin: 8px auto;
  padding: 0 16px;
  border-bottom: 1px solid #333;
  max-width: 600px;
  display: flex;
  flex-wrap: wrap;
  li {
    margin: 8px;
    padding: 16px;
    border: 1px solid #666;
    border-radius: 8px;
    flex: 0 1 150px;
  }
`;

export function TermCardList({ terms }: { terms: TermCardWithStats<Card>[] }) {
  return (
    <StyledTermList>
      {terms.map((term, termIdx) => (
        <li key={termIdx}>
          <p>{term.card.syllabary}</p>
          <p>{term.card.english}</p>
        </li>
      ))}
    </StyledTermList>
  );
}
