import {
  createContext,
  PropsWithChildren,
  Context,
  useContext,
  useEffect,
} from "react";
import { useCachedLeitnerBoxes } from "./useCachedLeitnerBoxes";
import { UseLeitnerBoxesReturn } from "./useLeitnerBoxes";

const LeitnerBoxContext = createContext<UseLeitnerBoxesReturn | null>(null);

export interface LeitnerBoxProviderProps {
  numBoxes: number;
  localStorageKey: string;
}

export function LeitnerBoxProvider({
  numBoxes,
  localStorageKey,
  children,
}: PropsWithChildren<LeitnerBoxProviderProps>) {
  const value = useCachedLeitnerBoxes({
    numBoxes,
    localStorageKey,
  });

  useEffect(() => {
    // handle resizes if we ever deploy them
    if (value.state.numBoxes !== numBoxes) value.resize(numBoxes);
  }, []);
  return (
    <LeitnerBoxContext.Provider value={value}>
      {children}
    </LeitnerBoxContext.Provider>
  );
}

export function useLeitnerBoxContext(): UseLeitnerBoxesReturn {
  const value = useContext(LeitnerBoxContext);
  if (value === null)
    throw new Error(
      "useLeitnerBoxContext must be used under a LeitnerBoxProvider"
    );

  return value;
}
