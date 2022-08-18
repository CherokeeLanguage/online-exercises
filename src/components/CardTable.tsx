import { ReactElement } from "react";
import { Card } from "../data/clean-cll-data";
import { StyledTable } from "./StyledTable";

export function CardTable({ cards }: { cards: Card[] }): ReactElement {
  return (
    <StyledTable>
      <thead>
        <tr>
          <th>Syllabary</th>
          <th>English translation</th>
        </tr>
      </thead>
      <tbody>
        {cards.map((card) => (
          <tr>
            <td>{card.syllabary}</td>
            <td>{card.english}</td>
          </tr>
        ))}
      </tbody>
    </StyledTable>
  );
}
