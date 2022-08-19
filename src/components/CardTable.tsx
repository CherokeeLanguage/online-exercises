import { ReactElement, useState } from "react";
import { Card } from "../data/clean-cll-data";
import { Button } from "./Button";
import { Modal } from "./Modal";
import { StyledTable } from "./StyledTable";
import { VisuallyHidden } from "./VisuallyHidden";

export function CardTable({ cards }: { cards: Card[] }): ReactElement {
  const [modalOpenForCard, showDetailsForCard] = useState<Card | undefined>(
    undefined
  );

  return (
    <>
      <StyledTable>
        <thead>
          <tr>
            <th style={{ width: "50%" }}>Cherokee</th>
            <th style={{ width: "50%" }}>English translation</th>
            <th>
              <VisuallyHidden>Button to show card audio</VisuallyHidden>
            </th>
          </tr>
        </thead>
        <tbody>
          {cards.map((card, idx) => (
            <CardRow
              card={card}
              key={idx}
              showDetailsForCard={showDetailsForCard}
            />
          ))}
        </tbody>
      </StyledTable>
      {modalOpenForCard !== undefined && (
        <CardDetailsModal
          card={modalOpenForCard}
          close={() => showDetailsForCard(undefined)}
        />
      )}
    </>
  );
}

function CardRow({
  card,
  showDetailsForCard,
}: {
  card: Card;
  showDetailsForCard: (card: Card) => void;
}) {
  return (
    <>
      <tr>
        <td>{card.syllabary}</td>
        <td>{card.english}</td>
        <td>
          <Button
            onClick={() => showDetailsForCard(card)}
            style={{ width: "100%" }}
          >
            More
          </Button>
        </td>
      </tr>
    </>
  );
}

function CardDetailsModal({ card, close }: { card: Card; close: () => void }) {
  return (
    <Modal close={close} title={`Card details - ${card.syllabary}`}>
      <CardAudioModalContent card={card} />
    </Modal>
  );
}

function CardAudioModalContent({ card }: { card: Card }) {
  return (
    <div>
      <h4>Alternate spellings</h4>
      {card.alternate_syllabary.map((s) => (
        <p>{s}</p>
      ))}
      <h4>English translation</h4>
      {card.english}
      <h4>Cherokee audio</h4>
      {card.cherokee_audio.map((src, idx) => (
        <audio src={src} key={idx} controls style={{ width: "100%" }}></audio>
      ))}
    </div>
  );
}
