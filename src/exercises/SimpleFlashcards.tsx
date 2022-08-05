import React, {
  ChangeEvent,
  ReactElement,
  useId,
  useMemo,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import { useKeyPressEvent } from "react-use";
import styled from "styled-components";
import { Card, cards, keyForCard } from "../data/clean-cll-data";
import { getTerms, lessonNameValid } from "../data/utils";
import { useLeitnerBoxContext } from "../utils/LeitnerBoxProvider";
import { useAudio } from "../utils/useAudio";
import { useCardsForTerms } from "../utils/useCardsForTerms";
import {
  TermCardWithStats,
  useLeitnerReviewSession,
} from "../utils/useLeitnerReviewSession";

export function SimpleFlashcardsForLesson(): ReactElement {
  const { lessonName, cumulative: rawCumulative } = useParams();
  const cumulative = rawCumulative?.toLowerCase() === "true";
  if (!lessonName) throw new Error("Lesson name is required");
  if (!lessonNameValid(lessonName)) throw new Error("Lesson name not found");

  const lessonTerms = useMemo(
    () => getTerms(lessonName, cumulative),
    [lessonName, cumulative]
  );
  return <SimpleFlashcards lessonTerms={lessonTerms} />;
}

export function SimpleFlashcardsAllSeenTerms(): ReactElement {
  const leitnerBoxes = useLeitnerBoxContext();

  const lessonTerms = useMemo(
    () => Object.keys(leitnerBoxes.state.terms),
    [leitnerBoxes.state.terms]
  );
  return <SimpleFlashcards lessonTerms={lessonTerms} />;
}

export function SimpleFlashcards({
  lessonTerms,
}: {
  lessonTerms: string[];
}): ReactElement {
  const lessonCards = useCardsForTerms(cards, lessonTerms, keyForCard);

  const leitnerBoxes = useLeitnerBoxContext();
  const { ready, currentCard, reviewCurrentCard } = useLeitnerReviewSession(
    leitnerBoxes,
    lessonCards
  );

  const done = useMemo(
    () => currentCard?.stats?.nextShowTime > Date.now() + 1000 * 60 * 60,
    [currentCard]
  );

  if (!ready) return <p> Loading...</p>;
  if (done)
    return (
      <>
        <p>
          You've reviewed these cards as much as you should today. Time to take
          a break or learn some more vocabulary.
        </p>
        <p>
          Come back in{" "}
          {Math.floor(
            (currentCard.stats.nextShowTime - Date.now()) / 1000 / 60 / 60
          )}{" "}
          hours
        </p>
      </>
    );
  else
    return (
      <div style={{ maxWidth: "800px", margin: "auto" }}>
        <p>
          Here you can review your terms as flashcards. Click the card to flip
          between Cherokee and English. You can mark if you answered correctly
          or incorrectly with the controls at bottom.
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
`;

const StyledFlashcardBody = styled.button`
  border: 1px solid #333;
  width: 300px;
  height: 200px;
  margin: 30px auto;
  padding: 8px;
  box-shadow: 1px 1px 8px #666;
  display: flex;
  align-items: center;
  outline: none;
  p {
    flex: 1;
    text-align: center;
    font-size: 24px;
  }
`;

export function Flashcard({
  card,
  reviewCurrentCard,
}: {
  card: TermCardWithStats<Card>;
  reviewCurrentCard: (correct: boolean) => void;
}) {
  const [cardFlipped, setCardFlipped] = useState(false);
  const [startSide, setStartSide] = useState<"cherokee" | "english">(
    "cherokee"
  );
  const [side, setSide] = useState(startSide);
  const [lastReviewed, setLastReviewed] = useState<string | undefined>(
    undefined
  );

  function flipCard() {
    console.log("Flipping card...");
    setSide(side === "cherokee" ? "english" : "cherokee");
    setCardFlipped(true);
  }

  function reviewCardAndResetState(correct: boolean) {
    reviewCurrentCard(correct);
    setLastReviewed(card.term);
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

  useKeyPressEvent(" ", () => {
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

  // pick random cherokee voice to use
  const audio = useMemo(() => {
    const options =
      side === "cherokee" ? card.card.cherokee_audio : card.card.english_audio;
    return options[Math.floor(Math.random() * options.length)];
  }, [card, side]);

  const { play, playing } = useAudio({
    src: audio,
    autoplay: true,
  });

  const selectId = useId();

  return (
    <FlashcardWrapper>
      <form>
        <label htmlFor={selectId}></label>
        <select id={selectId} value={startSide} onChange={onStartSideChange}>
          <option value="cherokee">Cherokee</option>
          <option value="english">English</option>
        </select>
      </form>
      <StyledFlashcardBody
        onClick={() => {
          console.log("button click flip");
          flipCard();
        }}
      >
        <p>{side === "cherokee" ? card.card.syllabary : card.card.english}</p>
      </StyledFlashcardBody>
      <FlashcardControls playAudio={play} reviewCard={reviewCardOrFlip} />
    </FlashcardWrapper>
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
