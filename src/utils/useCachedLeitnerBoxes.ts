import { useEffect } from "react";
import { useLocalStorage } from "react-use";
import { LeitnerBoxState, useLeitnerBoxes } from "./useLeitnerBoxes";

interface UseCachedLeitnerBoxesProps {
  numBoxes: number;
  localStorageKey: string;
  initialTerms: string[];
}

// cards replaced with key (cherokee pronounciation)
export type KeyedLeitnerBoxState = LeitnerBoxState;

export class MissingCardsError extends Error {
  missingCards: string[];
  constructor(missingCards: string[]) {
    super(`Failed to deserialize ${missingCards.length} cards`);
    this.missingCards = missingCards;
  }
}

export function useCachedLeitnerBoxes({
  numBoxes,
  localStorageKey,
  initialTerms,
}: UseCachedLeitnerBoxesProps) {
  const [storedState, setStoredState] = useLocalStorage<LeitnerBoxState | null>(
    localStorageKey,
    undefined,
    {
      raw: false,
      serializer: JSON.stringify,
      deserializer: JSON.parse,
    }
  );

  const useLeitnerBoxesReturn = useLeitnerBoxes(
    storedState
      ? {
          type: "LOAD",
          state: storedState,
        }
      : {
          type: "NEW",
          numBoxes: numBoxes,
          initialTerms,
        }
  );

  useEffect(() => {
    if (useLeitnerBoxesReturn.state !== storedState) {
      setStoredState(useLeitnerBoxesReturn.state);
    }
  }, [useLeitnerBoxesReturn.state]);

  return useLeitnerBoxesReturn;
}
