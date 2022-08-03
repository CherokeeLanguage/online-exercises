import { ReactNode, useMemo, useState } from "react";
import styled from "styled-components";
import { Card, cards, keyForCard } from "./data/clean-cll-data";
import { useLeitnerBoxContext } from "./utils/LeitnerBoxProvider";
import { useCardsForTerms } from "./utils/useCardsForTerms";
import { TermCardWithStats } from "./utils/useLeitnerReviewSession";

const TermList = styled.ul`
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

export function Overview() {
  const leitnerBoxes = useLeitnerBoxContext();

  const allTerms = useMemo(
    () => Object.keys(leitnerBoxes.state.terms),
    [leitnerBoxes.state.terms]
  );

  const termCards = useCardsForTerms(cards, allTerms, keyForCard);

  const termsByBox = Object.entries(leitnerBoxes.state.terms)
    .map(([term, stats]) => ({
      term,
      stats,
      card: termCards[term],
    }))
    .reduce<TermCardWithStats<Card>[][]>(
      (boxes, term) =>
        boxes.map((box, boxIdx) =>
          boxIdx === term.stats.box ? [...box, term] : box
        ),
      new Array(leitnerBoxes.state.numBoxes).fill(undefined).map(() => [])
    );

  function boxDescription(idx: number) {
    if (idx === 0) return " (new terms)";
    else if (idx === leitnerBoxes.state.numBoxes - 1)
      return " (perfected terms)";
    else return "";
  }

  return (
    <div>
      {termsByBox.map((terms, boxIdx) => (
        <ProficiencyLevel
          key={boxIdx}
          description={`Proficiency level ${boxIdx + 1}${boxDescription(
            boxIdx
          )} - ${terms.length} terms`}
          terms={terms}
        />
      ))}
    </div>
  );
}

function ProficiencyLevel({
  description,
  terms,
}: {
  description: ReactNode;
  terms: TermCardWithStats<Card>[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <h2>
        {description}{" "}
        <button onClick={() => setOpen(!open)}>
          {open ? "Hide terms" : "View terms"}
        </button>
      </h2>
      {open && (
        <TermList>
          {terms.map((term, termIdx) => (
            <li key={termIdx}>
              <p>{term.card.syllabary}</p>
              <p>{term.card.english}</p>
            </li>
          ))}
        </TermList>
      )}
    </div>
  );
}
