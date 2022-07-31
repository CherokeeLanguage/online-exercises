import { Reducer, useMemo, useReducer, useState } from "react";
import { weightedRandom } from "./weightedRandom";

interface NewUseLeitnerBoxesProps<T> {
  type: "NEW";
  numBoxes: number;
  initialCards: T[];
}

interface LoadUseLeitnerBoxProps<T> {
  type: "LOAD";
  state: LeitnerBoxState<T>;
}

export type UseLeitnerBoxesProps<T> =
  | NewUseLeitnerBoxesProps<T>
  | LoadUseLeitnerBoxProps<T>;

interface UseLeitnerBoxesReturn<T> {
  currentCard: T;
  state: LeitnerBoxState<T>;
  next: (cardCorrect: boolean) => void;
}

interface BoxedCard<T> {
  card: T;
  box: number;
  index: number;
}

export interface LeitnerBoxState<T> {
  /**
   * Cards, in boxes, order by competency least to greatest.
   * These only change when a card is reviwed
   */
  boxes: T[][];
  /**
   * Cards left to review in the current session.
   */
  cardsToReview: BoxedCard<T>[];
}

type LeitnerBoxAction = {
  type: "next";
  correct: boolean; // was previous card answered correctly?
};

/**
 * Move a card from one box to the end of the specified target box
 * @param boxes
 * @param currentBox
 * @param currentCardIdx
 * @param targetBox
 * @returns
 */
function moveCard<T>(
  boxes: T[][],
  currentBox: number,
  currentCardIdx: number,
  targetBox: number
): T[][] {
  const newBoxes = boxes.slice(0);
  if (currentBox === targetBox) {
    // move to end of target/current
    newBoxes[currentBox] = [
      ...boxes[currentBox].slice(0, currentCardIdx),
      ...boxes[currentBox].slice(currentCardIdx + 1),
      boxes[currentBox][currentCardIdx],
    ];
  } else {
    // append to target
    newBoxes[targetBox] = [
      ...boxes[targetBox],
      boxes[currentBox][currentCardIdx],
    ];
    // remove from current
    newBoxes[currentBox] = [
      ...boxes[currentBox].slice(0, currentCardIdx),
      ...boxes[currentBox].slice(currentCardIdx + 1),
    ];
  }
  return newBoxes;
}

function pickCardBox(boxes: unknown[][]) {
  return weightedRandom(
    boxes.map((box, idx) => box.length && Math.pow(1 / 2, idx))
  );
}

function reduceLeitnerBoxState<T>(
  numBoxes: number
): Reducer<LeitnerBoxState<T>, LeitnerBoxAction> {
  return function (state, action) {
    switch (action.type) {
      case "next":
        console.log("next action");
        const currentCard = state.cardsToReview[0];
        // move current card
        const newBoxes = moveCard(
          state.boxes,
          currentCard.box,
          currentCard.index,
          // correct cards advance
          // incorrect card go back to 0
          action.correct ? Math.min(currentCard.box + 1, numBoxes - 1) : 0
        );
        let remainingCardsToReview = state.cardsToReview.slice(1);
        if (remainingCardsToReview.length) {
          return {
            boxes: newBoxes,
            cardsToReview: remainingCardsToReview,
          };
        } else {
          return {
            boxes: newBoxes,
            cardsToReview: flattenBoxes(newBoxes),
          };
        }
    }
  };
}

function flattenBoxes<T>(boxes: T[][]): BoxedCard<T>[] {
  return boxes.flatMap((box, boxIdx) =>
    box.map((card, cardIdx) => ({
      card,
      box: boxIdx,
      index: cardIdx,
    }))
  );
}

function initLeiterBoxState<T>({
  numBoxes,
  initialCards,
}: {
  numBoxes: number;
  initialCards: T[];
}): LeitnerBoxState<T> {
  const boxes = [
    initialCards,
    ...new Array(numBoxes - 1).fill(undefined).map((_) => []),
  ];
  return {
    boxes,
    cardsToReview: flattenBoxes(boxes),
  };
}

export function useLeitnerBoxes<T>(
  props: UseLeitnerBoxesProps<T>
): UseLeitnerBoxesReturn<T> {
  const [state, dispatch] = useReducer<
    Reducer<LeitnerBoxState<T>, LeitnerBoxAction>
  >(
    reduceLeitnerBoxState(
      props.type === "NEW" ? props.numBoxes : props.state.boxes.length
    ),
    props.type === "NEW" ? initLeiterBoxState(props) : props.state
  );

  const { card: currentCard } = useMemo(() => {
    return state.cardsToReview[0];
  }, [state.cardsToReview]);

  return {
    currentCard,
    state,
    next(correct) {
      dispatch({
        type: "next",
        correct,
      });
    },
  };
}
