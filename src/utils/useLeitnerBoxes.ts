import { Reducer, useMemo, useReducer, useState } from "react";

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
}

export interface LeitnerBoxState<T> {
  /**
   * Boxes for cards that have already been reviewed
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

function reduceLeitnerBoxState<T>(
  numBoxes: number
): Reducer<LeitnerBoxState<T>, LeitnerBoxAction> {
  return function (state, action) {
    switch (action.type) {
      case "next":
        console.log("next action");
        const currentCard = state.cardsToReview[0];
        const newBoxForCard = action.correct
          ? Math.min(currentCard.box + 1, numBoxes - 1)
          : 0;
        const newBoxes = state.boxes.map((box, idx) =>
          idx === newBoxForCard ? [...box, currentCard.card] : box
        );
        let remainingCardsToReview = state.cardsToReview.slice(1);
        if (remainingCardsToReview.length) {
          return {
            boxes: newBoxes,
            cardsToReview: remainingCardsToReview.sort(),
          };
        } else {
          // move cards from boxes into cardsToReview
          return dealCards(newBoxes);
        }
    }
  };
}

function shuffle<T>(list: T[]): T[] {
  return list
    .map((t) => ({ t, k: Math.random() }))
    .sort((a, b) => a.k - b.k)
    .map(({ t }) => t);
}

/**
 * Randomly select some boxes for review, based on exponential curve.
 */
function dealCards<T>(
  boxes: T[][],
  initialCardsToReview?: BoxedCard<T>[]
): LeitnerBoxState<T> {
  const firstNonEmptyBox = boxes.findIndex((box) => box.length > 0);
  const state = boxes.reduce<LeitnerBoxState<T>>(
    ({ boxes, cardsToReview }, box, boxIdx) => {
      // decide which boxes to include with exponential fall off
      const includeBoxInLesson =
        Math.random() < Math.pow(1 / 2, boxIdx - firstNonEmptyBox);
      return {
        boxes: [...boxes, includeBoxInLesson ? [] : box],
        cardsToReview: includeBoxInLesson
          ? [...cardsToReview, ...box.map((card) => ({ card, box: boxIdx }))]
          : cardsToReview,
      };
    },
    { boxes: [], cardsToReview: initialCardsToReview ?? [] }
  );
  if (state.cardsToReview.length)
    return {
      boxes: state.boxes,
      cardsToReview: shuffle(state.cardsToReview),
    };
  else return dealCards(state.boxes, state.cardsToReview);
}

export function flattenBoxes<T>(boxes: T[][]): BoxedCard<T>[] {
  return boxes.flatMap((box, boxIdx) =>
    box.map((card) => ({
      card,
      box: boxIdx,
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
  return {
    // boxes are empty
    boxes: new Array(numBoxes).fill(undefined).map(() => []),
    // all cards are unknown
    cardsToReview: initialCards.map((card) => ({ card, box: 0 })),
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
