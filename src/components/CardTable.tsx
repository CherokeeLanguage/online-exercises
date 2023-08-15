import { ReactElement, useState } from "react";
import { Card } from "../data/cards";
import { showPhonetics } from "../state/reducers/phoneticsPreference";
import { useUserStateContext } from "../providers/UserStateProvider";
import { getPhonetics } from "../utils/phonetics";
import { Button } from "./Button";
import { Modal } from "./Modal";
import { StyledTable } from "./StyledTable";
import { VisuallyHidden } from "./VisuallyHidden";
import { FlagIssueButton } from "./FlagIssueModal";
import styled from "styled-components";
import { AlignedCherokee } from "./AlignedCherokee";
import { theme } from "../theme";

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
          <strong>{card.syllabary}</strong>
          {showPhonetics(phoneticsPreference) && (
            <>
              <br />
              {getPhonetics(card, phoneticsPreference)}
            </>
          )}
        </td>
        <td>{card.english}</td>
        <td>
          <Button
            onClick={() => showDetailsForCard(card)}
            style={{ padding: "0 5px" }}
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
    <Modal close={close} title={`Card details`}>
      <CardDetailsModalContent card={card} />
    </Modal>
  );
}

const CardDetailsContentWrapper = styled.div`
  h4 {
    font-weight: bold;
    font-size: ${theme.fontSizes.md};
    margin: 10px 0;
  }
  p {
    margin: 0;
    margin-left: 8px;
  }
`;

function CardDetailsModalContent({ card }: { card: Card }) {
  const {
    config: { phoneticsPreference },
  } = useUserStateContext();
  return (
    <CardDetailsContentWrapper>
      <h4>Cherokee</h4>
      <AlignedCherokee
        syllabary={card.syllabary}
        phonetics={getPhonetics(card, phoneticsPreference)}
        fontSize={theme.fontSizes.sm}
      />
      {card.alternate_syllabary.length > 0 && (
        <>
          <h4>Alternate spellings</h4>
          {card.alternate_syllabary.map((s) => (
            <p>{s}</p>
          ))}
        </>
      )}
      <h4>English translation</h4>
      <p>{card.english}</p>
      <hr></hr>

      <h4>Cherokee audio</h4>
      <AudioList>
        {card.cherokee_audio.map((src, idx) => (
          <AudioRow src={src} card={card} key={idx} />
        ))}
      </AudioList>
    </CardDetailsContentWrapper>
  );
}

const AudioList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
  li {
    display: flex;
    gap: 4px;
    align-items: center;
    audio {
      flex: 1;
    }
  }
`;

function AudioRow({ src, card }: { src: string; card: Card }) {
  return (
    <li>
      <audio src={src} controls style={{ width: "100%" }} />
      <FlagIssueButton
        problematicAudio={src}
        card={card}
        style={{ margin: 0 }}
      />
    </li>
  );
}
