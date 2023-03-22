import { ReactElement, useState } from "react";
import { Card } from "../data/cards";
import {
  PhoneticsPreference,
  showPhonetics,
} from "../state/reducers/phoneticsPreference";
import { useUserStateContext } from "../state/UserStateProvider";
import { createIssueForTermInNewTab } from "../utils/createIssue";
import { getPhonetics } from "../utils/phonetics";
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
  const {
    config: { phoneticsPreference },
  } = useUserStateContext();
  return (
    <>
      <tr>
        <td>
          {card.syllabary}
          {showPhonetics(phoneticsPreference) && (
            <span> | {getPhonetics(card, phoneticsPreference)}</span>
          )}
        </td>
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
  const {
    config: { phoneticsPreference },
  } = useUserStateContext();
  return (
    <div>
      {showPhonetics(phoneticsPreference) && (
        <>
          <h4>Phonetics</h4>
          <p>{getPhonetics(card, phoneticsPreference)}</p>
        </>
      )}
      {card.alternate_syllabary.length > 0 && (
        <>
          <h4>Alternate spellings</h4>
          {card.alternate_syllabary.map((s) => (
            <p>{s}</p>
          ))}
        </>
      )}
      <h4>English translation</h4>
      {card.english}
      <hr></hr>
      <StyledTable>
        <thead>
          <tr>
            <th>Cherokee audio</th>
            <th>
              <VisuallyHidden>Button to flag an issue with term</VisuallyHidden>
            </th>
          </tr>
        </thead>
        <tbody>
          {card.cherokee_audio.map((src, idx) => (
            <AudioRow src={src} term={card.cherokee} key={idx} />
          ))}
        </tbody>
      </StyledTable>
    </div>
  );
}

function AudioRow({ src, term }: { src: string; term: string }) {
  const {
    config: { groupId },
  } = useUserStateContext();
  return (
    <tr>
      <td>
        <audio src={src} controls style={{ width: "100%" }} />
      </td>
      <td>
        <Button
          variant="negative"
          onClick={() => createIssueForTermInNewTab(groupId, term)}
        >
          Flag issue
        </Button>
      </td>
    </tr>
  );
}
