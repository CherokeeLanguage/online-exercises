import { User } from "firebase/auth";
import { DatabaseReference, ref, set } from "firebase/database";
import { db } from ".";
import { FirebaseReviewedTerms } from "../spaced-repetition/useReviewSession";
import { LeitnerBoxState } from "../state/reducers/leitnerBoxes";
import { Lesson } from "../state/reducers/lessons";
import { LegacyUserState, UserConfig } from "../state/useUserState";
import { IssueReport } from "./types";

export type TypedRef<T> = {
  ref: DatabaseReference;
  // make sure we remember the type
  type?: T;
};

export function setTyped<T>(ref: TypedRef<T>, value: T): Promise<void> {
  return set(ref.ref, value);
}

export function userLeitnerBoxesPath(user: User): TypedRef<LeitnerBoxState> {
  return {
    ref: ref(db, `users/${user.uid}/leitnerBoxes`),
  };
}

export function userConfigPath(user: User): TypedRef<UserConfig> {
  return {
    ref: ref(db, `users/${user.uid}/config`),
  };
}

export function localStorageStateBackupPath(
  user: User
): TypedRef<LegacyUserState> {
  return {
    ref: ref(db, `users/${user.uid}/backupLocalStorageState`),
  };
}

export function lessonMetadataPath(
  user: User,
  lessonId: string
): TypedRef<Lesson> {
  return {
    ref: ref(db, `users/${user.uid}/lessonMeta/${lessonId}`),
  };
}

export function allLessonMetadataPath(
  user: User
): TypedRef<Record<string, Lesson>> {
  return {
    ref: ref(db, `users/${user.uid}/lessonMeta/`),
  };
}

export function lessonReviewedTermsPath(
  user: User,
  lessonId: string
): TypedRef<FirebaseReviewedTerms> {
  return {
    ref: ref(db, `users/${user.uid}/lessonReviewedTerms/${lessonId}/`),
  };
}

export function issueReportPath(issueId: string): TypedRef<IssueReport> {
  return {
    ref: ref(db, `issueReports/${issueId}`),
  };
}
