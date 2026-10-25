import { GroupId, GROUPS } from "./reducers/groupId";
import { ReviewResult } from "./reducers/leitnerBoxes";
import { Lesson } from "./reducers/lessons";
import { LessonCreationError } from "./reducers/lessons/createNewLesson";
import { PhoneticsPreference } from "./reducers/phoneticsPreference";
import { LegacyUserState, UserState } from "./useUserState";

export type ResizeLeitnerBoxesAction = {
  type: "RESIZE_LEITNER_BOXES";
  newNumBoxes: number;
};

export type AddSetAction = {
  type: "ADD_SET";
  setToAdd: string;
};

export type RemoveSetAction = {
  type: "REMOVE_SET";
  setToRemove: string;
};

export type SetAction = AddSetAction | RemoveSetAction;

export type SetUpstreamCollectionAction = {
  type: "SET_UPSTREAM_COLLECTION";
  newCollectionId: string | null;
};

export type RegisterWithGroupAction = {
  type: "REGISTER_GROUP_AND_APPLY_DEFAULTS";
  groupId: GroupId;
};

export type LoadStateAction = {
  type: "LOAD_STATE";
  state: LegacyUserState;
};

export type StartLessonAction = {
  type: "START_LESSON";
  lessonId: string;
};

export type ConcludeLessonAction = {
  type: "CONCLUDE_LESSON";
  lesson: Lesson;
  reviewedTerms: Record<string, ReviewResult>;
};

export type FlagLessonCreationError = {
  type: "LESSON_CREATE_ERROR";
  error: LessonCreationError;
};

export type LessonsAction =
  | ConcludeLessonAction
  | StartLessonAction
  | FlagLessonCreationError;

export type HandleSetChangesAction = {
  type: "HANDLE_SET_CHANGES";
};

export type SetWhereFound = {
  type: "WHERE_FOUND";
  whereFound: string;
  
}

// FIXME: I think 'preferences' could get moved into a separate part of the codebase so this doesn't keep getting longer
export type SetPhoneticsPreferenceAction = {
  type: "SET_PHONETICS_PREFERENCE";
  newPreference: PhoneticsPreference;
};
export type SetUserEmailAction = {
  type: "SET_USER_EMAIL";
  newUserEmail: string;
};

export type UserStateAction =
  | SetUpstreamCollectionAction
  | RegisterWithGroupAction
  | LoadStateAction
  | ResizeLeitnerBoxesAction
  | SetAction
  | LessonsAction
  | HandleSetChangesAction
  | SetPhoneticsPreferenceAction
  | SetUserEmailAction
  | SetWhereFound;
