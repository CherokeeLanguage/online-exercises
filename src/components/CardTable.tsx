import { ReactElement } from "react";
import styled from "styled-components";
import { Card } from "../data/clean-cll-data";
import { StyledTable } from "./StyledTable";

const CardTableWrapper = styled.div`
  max-width: 600px;
`;

export function CardTable({ cards }: { cards: Card[] }): ReactElement {
  return (
    <CardTableWrapper>
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
    </CardTableWrapper>
  );
}
