import { onValue, ref, set } from "firebase/database";
import { useEffect, useMemo, useState } from "react";
import { db } from ".";

type LoadingState = { ready: false };
type DataState<T> = { ready: true; data: T };

type FirebaseState<T> = LoadingState | DataState<T>;

/**
 * Like `useState` or `useLocalStorage` but its in Firebase.
 */
export function useFirebase<T>(
  path: string
): [FirebaseState<T>, (newState: T) => void] {
  const [state, setInternalState] = useState<FirebaseState<T>>({
    ready: false,
  });
  const dataRef = useMemo(() => ref(db, path), [path]);

  useEffect(() => {
    onValue(dataRef, (snapshot) => {
      const data = snapshot.val() ?? null;
      setInternalState({ ready: true, data });
    });
  }, [dataRef]);

  const setFirebaseState = useMemo(
    () => (newState: T) => {
      set(dataRef, newState);
    },
    [dataRef]
  );

  return [state, setFirebaseState];
}
