import { useEffect } from "react";
import { useLocalStorage } from "react-use";
import { Card } from "../clean-cll-data";
import { LeitnerBoxState, useLeitnerBoxes } from "./useLeitnerBoxes";

interface UseCachedLeitnerBoxesProps<T extends Card> {
  numBoxes: number;
  localStorageKey: string;
  initialCards: T[];
  allCards: T[];
}

// cards replaced with key (cherokee pronounciation)
export type KeyedLeitnerBoxState = LeitnerBoxState<string>;

export function serializeLeitnerBoxState<T extends Card>(
  state: LeitnerBoxState<T> | null
): KeyedLeitnerBoxState {
  if (!state) {
    return {
      // replace cards with cherokee phonetics, as a key
      boxes: [],
      cardsToReview: [],
    };
  }
  return {
    // replace cards with cherokee phonetics, as a key
    boxes: state.boxes.map((box) => box.map((card) => card.cherokee)),
    cardsToReview: state.cardsToReview.map(({ card, ...rest }) => ({
      ...rest,
      card: card.cherokee,
    })),
  };
}

function lookupCardsAndCollectMissing<T extends Card, L, U>(
  lookups: L[],
  cards: T[],
  keyFn: (key: L) => string,
  map: (lookup: L, card: T) => U
): [U[], string[]] {
  return lookups.reduce<[U[], string[]]>(
    ([found, missing], lookup) => {
      const key = keyFn(lookup);
      const match = cards.find((card) => card.cherokee === key);
      if (match) {
        return [[...found, map(lookup, match)], missing];
      } else {
        return [found, [...missing, key]];
      }
    },
    [[], []]
  );
}

export class MissingCardsError extends Error {
  missingFromBoxes: string[];
  missingFromToReview: string[];
  constructor(missingFromBoxes: string[], missingFromToReview: string[]) {
    super(
      `Failed to deserialize some cards (${missingFromBoxes.length} in boxes, ${missingFromToReview.length} from to review pile)`
    );
    this.missingFromBoxes = missingFromBoxes;
    this.missingFromToReview = missingFromToReview;
  }
}

export function deserializeLeitnerBoxState<T extends Card>(
  cards: T[],
  keyedState: KeyedLeitnerBoxState
): LeitnerBoxState<T> {
  const [boxes, missingFromBoxes] = keyedState.boxes.reduce<[T[][], string[]]>(
    ([boxes, missing], box) => {
      const [foundBox, newMissing] = lookupCardsAndCollectMissing(
        box,
        cards,
        (k) => k,
        (_l, c) => c
      );
      return [
        [...boxes, foundBox],
        [...missing, ...newMissing],
      ];
    },
    [[], []]
  );
  const [cardsToReview, missingFromCardsToReview] =
    lookupCardsAndCollectMissing(
      keyedState.cardsToReview,
      cards,
      (bc) => bc.card,
      (bc, card) => ({ ...bc, card })
    );

  if (missingFromBoxes.length || missingFromCardsToReview.length) {
    throw new MissingCardsError(missingFromBoxes, missingFromCardsToReview);
  }

  return {
    boxes,
    cardsToReview,
  };
}

export function useCachedLeitnerBoxes<T extends Card>({
  numBoxes,
  localStorageKey,
  initialCards,
  allCards,
}: UseCachedLeitnerBoxesProps<T>) {
  const [storedState, setStoredState] =
    useLocalStorage<LeitnerBoxState<T> | null>(localStorageKey, undefined, {
      raw: false,
      serializer: (state) => JSON.stringify(serializeLeitnerBoxState(state)),
      deserializer: (serialized: string) =>
        deserializeLeitnerBoxState(allCards, JSON.parse(serialized)),
    });

  const useLeitnerBoxesReturn = useLeitnerBoxes(
    storedState
      ? {
          type: "LOAD",
          state: storedState,
        }
      : {
          type: "NEW",
          numBoxes: numBoxes,
          initialCards,
        }
  );

  useEffect(
    () => setStoredState(useLeitnerBoxesReturn.state),
    [useLeitnerBoxesReturn.state]
  );

  return useLeitnerBoxesReturn;
}
