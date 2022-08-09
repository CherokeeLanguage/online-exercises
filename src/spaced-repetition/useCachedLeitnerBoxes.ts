import { useEffect } from "react";
import { useLocalStorage } from "react-use";
import { LeitnerBoxState, useLeitnerBoxes } from "./useLeitnerBoxes";

interface UseCachedLeitnerBoxesProps {
  numBoxes: number;
  localStorageKey: string;
}

export function useCachedLeitnerBoxes({
  numBoxes,
  localStorageKey,
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
        }
  );

  useEffect(() => {
    if (useLeitnerBoxesReturn.state !== storedState) {
      setStoredState(useLeitnerBoxesReturn.state);
    }
  }, [useLeitnerBoxesReturn.state]);

  return useLeitnerBoxesReturn;
}
