import React, {
  ChangeEvent,
  ReactElement,
  useId,
  useMemo,
  useState,
} from "react";
import { useKeyPressEvent } from "react-use";
import styled from "styled-components";
import { Card } from "../../data/cards";
import { TermCardWithStats } from "../../spaced-repetition/types";
import { useUserStateContext } from "../../state/UserStateProvider";
import { theme } from "../../theme";
import { createIssueForTermInNewTab } from "../../utils/createIssue";
import {
  alignSyllabaryAndPhonetics,
  getPhonetics,
} from "../../utils/phonetics";
import { useAudio } from "../../utils/useAudio";
import { ExerciseComponentProps } from "./Exercise";

function pickRandomElement<T>(options: T[]) {
  return options[Math.floor(Math.random() * options.length)];
}

export function SimpleFlashcards({
  currentCard,
  reviewCurrentCard,
}: ExerciseComponentProps): ReactElement {
  return (
    <div style={{ maxWidth: "800px", margin: "auto" }}>
      <p>
        Here you can review your terms as flashcards. Click the card to flip
        between Cherokee and English. You can mark if you answered correctly or
        incorrectly with the controls at bottom.
      </p>
      <p>
        If you prefer to use the keyboard you can use the spacebar to flip the
        term, the enter key to mark a card as answered correctly, and the "x"
        key to mark a card as answered incorrectly.
      </p>
      <p>
        You can choose to start with English, but this is much harder and can
        lead to much longer sessions.
      </p>
      <Flashcard card={currentCard} reviewCurrentCard={reviewCurrentCard} />
    </div>
  );
}

const FlashcardWrapper = styled.div`
  max-width: 600px;
  margin: auto;
  text-align: center;
`;

const StyledFlashcardBody = styled.button`
  border: none;
  border-radius: 8px;
  width: 100%;
  min-height: 200px;
  margin: 30px auto;
  padding: 8px;
  display: block;
  align-items: center;
  outline: none;
  background: none;
  transition: box-shadow 0.1s linear;
  box-shadow: 1px 1px 0px #6660;
  &:hover {
    /* border: 1px solid #333; */
    box-shadow: 1px 1px 5px #666;
    /* background: ${theme.colors.LIGHTER_GRAY}; */
  }
  p {
    flex: 1;
    text-align: center;
    font-size: ${theme.fontSizes.lg};
  }
  mark {
    background: none;
    color: red;
    text-decoration: underline;
  }
`;

export function Flashcard({
  card,
  reviewCurrentCard,
}: {
  card: TermCardWithStats<Card>;
  reviewCurrentCard: (correct: boolean) => void;
}) {
  const { groupId, phoneticsPreference } = useUserStateContext();
  const [cardFlipped, setCardFlipped] = useState(false);
  const [startSide, setStartSide] = useState<"cherokee" | "english">(
    "cherokee"
  );
  const [side, setSide] = useState(startSide);
  const phonetics = useMemo(
    () => getPhonetics(card.card, phoneticsPreference),
    [card, phoneticsPreference]
  );

  function flipCard() {
    console.log("Flipping card...");
    setSide(side === "cherokee" ? "english" : "cherokee");
    setCardFlipped(true);
  }

  function reviewCardAndResetState(correct: boolean) {
    reviewCurrentCard(correct);
    setSide(startSide);
    setCardFlipped(false);
  }

  function reviewCardOrFlip(correct: boolean) {
    if (cardFlipped) {
      reviewCardAndResetState(correct);
    } else {
      flipCard();
    }
  }

  useKeyPressEvent(" ", (event) => {
    event.preventDefault(); // sometimes button will try to get clicked too
    flipCard();
  });

  useKeyPressEvent("x", () => {
    reviewCardOrFlip(false);
  });

  useKeyPressEvent("Enter", (event) => {
    event.preventDefault(); // sometimes the button will try to get clicked too
    reviewCardOrFlip(true);
  });

  function onStartSideChange(e: ChangeEvent<HTMLSelectElement>) {
    e.preventDefault();
    const value = e.target.value;
    if (value === "cherokee" || value === "english") {
      setStartSide(value);
    } else {
      console.warn("Unrecognized start side!!");
    }
  }

  // pick random voice to use
  const [cherokeeAudio, englishAudio] = useMemo(() => {
    return [
      pickRandomElement(card.card.cherokee_audio),
      pickRandomElement(card.card.english_audio),
    ];
  }, [card]);

  const { play } = useAudio({
    src: side === "cherokee" ? cherokeeAudio : englishAudio,
    autoplay: true,
  });

  const selectId = useId();

  return (
    <FlashcardWrapper>
      <form>
        <label htmlFor={selectId}>Start with</label>
        <select id={selectId} value={startSide} onChange={onStartSideChange}>
          <option value="cherokee">Cherokee</option>
          <option value="english">English</option>
        </select>
      </form>
      <StyledFlashcardBody onClick={() => flipCard()}>
        {side === "english" ? (
          <p>{card.card.english}</p>
        ) : (
          <AlignedCherokee
            syllabary={card.card.syllabary}
            phonetics={phonetics}
          ></AlignedCherokee>
        )}
      </StyledFlashcardBody>
      <FlashcardControls playAudio={play} reviewCard={reviewCardOrFlip} />
      <button onClick={() => createIssueForTermInNewTab(groupId, card.term)}>
        Flag an issue with this term
      </button>
    </FlashcardWrapper>
  );
}

function AlignedTextRow({
  words,
  setHoveredIdx,
  hoveredIdx: [hoveredWordIdx, hoveredSegmentIdx],
}: {
  words: string[][];
  hoveredIdx: [number | null, number | null];
  setHoveredIdx: (idx: [number | null, number | null]) => void;
}) {
  return (
    <p>
      {words.map((word, wordIdx) => (
        <>
          {wordIdx === 0 ? "" : " "}
          {word.map((segment, segmentIdx) => (
            <span
              onMouseOver={() => setHoveredIdx([wordIdx, segmentIdx])}
              onMouseOut={() => setHoveredIdx([null, null])}
            >
              {hoveredWordIdx === wordIdx &&
              hoveredSegmentIdx === segmentIdx ? (
                <mark>{segment}</mark>
              ) : (
                segment
              )}
            </span>
          ))}
        </>
      ))}
    </p>
  );
}

function AlignedCherokee({
  syllabary,
  phonetics,
}: {
  syllabary: string;
  phonetics: string | undefined;
}): ReactElement {
  const [alignedSyllabaryWords, alignedPhoneticWords] = useMemo(
    () =>
      phonetics
        ? alignSyllabaryAndPhonetics(syllabary, phonetics)
        : [syllabary.split(" ").map((word) => word.split("")), []],
    [syllabary, phonetics]
  );
  const [hoveredIdx, setHoveredIdx] = useState<[number | null, number | null]>([
    null,
    null,
  ]);
  return (
    <div>
      <AlignedTextRow
        words={alignedSyllabaryWords}
        setHoveredIdx={setHoveredIdx}
        hoveredIdx={hoveredIdx}
      />
      {phonetics && (
        <>
          <hr />
          <AlignedTextRow
            words={alignedPhoneticWords}
            setHoveredIdx={setHoveredIdx}
            hoveredIdx={hoveredIdx}
          />
        </>
      )}
    </div>
  );
}

function FlashcardControls({
  reviewCard,
  playAudio,
}: {
  reviewCard: (correct: boolean) => void;
  playAudio: () => void;
}): ReactElement {
  return (
    <div>
      <button onClick={() => reviewCard(false)}>Answered incorrectly</button>
      <button onClick={() => playAudio()}>Listen again</button>
      <button onClick={() => reviewCard(true)}>Answered correctly</button>
    </div>
  );
}
