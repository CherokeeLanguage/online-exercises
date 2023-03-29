import { logEvent } from "firebase/analytics";
import { User } from "firebase/auth";
import { onValue, set } from "firebase/database";
import { useEffect, useMemo, useState } from "react";
import { analytics } from ".";
import {
  allLessonMetadataPath,
  lessonMetadataPath,
  lessonReviewedTermsPath,
  localStorageStateBackupPath,
  TypedRef,
  userConfigPath,
  userLeitnerBoxesPath,
} from "./paths";

export type LoadingState = { ready: false };
export type DataState<T> = { ready: true; data: T | null };

export type FirebaseState<T> = LoadingState | DataState<T>;

/**
 * Like `useState` or `useLocalStorage` but its in Firebase.
 */
export function useFirebase<T>(
  typedRef: TypedRef<T>
): [FirebaseState<T>, (newState: T) => Promise<void>] {
  const [state, setInternalState] = useState<FirebaseState<T>>({
    ready: false,
  });

  useEffect(() => {
    onValue(typedRef.ref, (snapshot) => {
      const data = snapshot.val() ?? null;
      setInternalState({ ready: true, data });
    });
  }, [typedRef]);

  const setFirebaseState = useMemo(
    () => (newState: T) => set(typedRef.ref, newState),
    [typedRef]
  );

  return [state, setFirebaseState];
}

/**
 * Makes sure this route is tracked in Google Analytics.
 */
export function useAnalyticsPageName(pageName: string): void {
  useEffect(() => {
    logEvent(analytics, "page_view", {
      page_title: pageName,
    });
  }, [pageName]);
}

export function useFirebaseLeitnerBoxes(user: User) {
  const ref = useMemo(() => userLeitnerBoxesPath(user), [user]);
  return useFirebase(ref);
}

export function useFirebaseUserConfig(user: User) {
  const ref = useMemo(() => userConfigPath(user), [user]);
  return useFirebase(ref);
}

export function useFirebaseLocalStorageStateBackup(user: User) {
  const ref = useMemo(() => localStorageStateBackupPath(user), [user]);
  return useFirebase(ref);
}

export function useFirebaseLessonMetadata(user: User, lessonId: string) {
  const ref = useMemo(
    () => lessonMetadataPath(user, lessonId),
    [user, lessonId]
  );
  return useFirebase(ref);
}
export function useFirebaseAllLessonMetadata(user: User) {
  const ref = useMemo(() => allLessonMetadataPath(user), [user]);
  return useFirebase(ref);
}

export function useFirebaseReviewedTerms(user: User, lessonId: string) {
  const ref = useMemo(
    () => lessonReviewedTermsPath(user, lessonId),
    [user, lessonId]
  );
  return useFirebase(ref);
}
