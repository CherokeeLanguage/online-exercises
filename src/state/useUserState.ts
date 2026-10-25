import { useEffect, useMemo } from "react";
import {
  LessonsInteractors,
  LessonsState,
  useLessonInteractors,
} from "../state/reducers/lessons";
import {
  LeitnerBoxesInteractors,
  LeitnerBoxState,
  reduceLeitnerBoxState,
  useLeitnerBoxesInteractors,
} from "../state/reducers/leitnerBoxes";
import { useReducerWithImperative } from "../utils/useReducerWithImperative";
import {
  reduceUserSetsState,
  UserSetsInteractors,
  UserSetsState,
  useUserSetsInteractors,
} from "../state/reducers/userSets";
import { UserStateAction } from "../state/actions";
import { LessonCreationError } from "../state/reducers/lessons/createNewLesson";
import {
  GroupId,
  GROUPS,
  isGroupId,
  reduceGroupId,
} from "../state/reducers/groupId";
import { PhoneticsPreference } from "../state/reducers/phoneticsPreference";
import { analytics, auth } from "../firebase";
import { logEvent } from "firebase/analytics";
import { uploadAllLessonDataFromLocalStorage } from "../firebase/migration";

export interface UserStateProps {
  leitnerBoxes: {
    numBoxes: number;
  };
}

export interface LegacyUserState {
  /** Terms the user is learning and ther progress */
  leitnerBoxes: LeitnerBoxState;
  /** Lessons that have been created for the user */
  lessons: LessonsState;
  /** Latest error describing why a lesson could not be created */
  lessonCreationError: LessonCreationError | undefined;
  /** Sets the user is learning */
  sets: UserSetsState;
  /** The collection from which new sets should be pulled when the user is ready for new terms */
  upstreamCollection: string | undefined;
  /** Group registration */
  groupId: GroupId | undefined;
  /** Preference for how phonetics are shown */
  phoneticsPreference: PhoneticsPreference | undefined;
  /** Has this state been uploaded to Firestore? */
  HAS_BEEN_UPLOADED?: true;
}

/**
 * Like legacy state but no lessons
 */
export interface UserConfig {
  /** Sets the user is learning */
  sets: UserSetsState;
  /** The collection from which new sets should be pulled when the user is ready for new terms */
  upstreamCollection: string | null;
  /** Sets where the user fond the site*/
  whereFound: string | null;
  /** Group registration */
  groupId: GroupId | null;
  /** Preference for how phonetics are shown */
  phoneticsPreference: PhoneticsPreference | null;
  /** Email address to contact the user */
  userEmail: string | null;
}

/**
 * Two slices of user state, managed separately by firebase
 */
export interface UserState {
  /** Simple config and data we are comfortable fetching all at once */
  config: UserConfig;
  /** Terms the user is learning and ther progress - split from config for semantic and scaling reasons */
  leitnerBoxes: LeitnerBoxState;
  /** Data we don't care about and don't save to the db */
  ephemeral: {
    /** Latest error describing why a lesson could not be created */
    lessonCreationError: LessonCreationError | null;
  };
}

interface MiscInteractors {
  setUpstreamCollection: (collectionId: string) => void;
  registerGroup: (groupId: string) => void;
  setPhoneticsPreference: (newPreference: PhoneticsPreference) => void;
  setUserEmail: (newUserEmail: string) => void;
  setWhereFound: (whereFound: string) => void;
  loadState: (state: LegacyUserState) => void;
}

export type UserInteractors = UserSetsInteractors &
  LessonsInteractors &
  LeitnerBoxesInteractors &
  MiscInteractors;

function reduceUpstreamCollection(
  { config: { upstreamCollection } }: UserState,
  action: UserStateAction
): string | null {
  if (action.type === "SET_UPSTREAM_COLLECTION") return action.newCollectionId;
  if (action.type === "REGISTER_GROUP_AND_APPLY_DEFAULTS")
    // if no upstream collection, set to group default
    return (
      upstreamCollection ?? GROUPS[action.groupId].defaultCollectionId ?? null
    );
  else return upstreamCollection;
}

function reducePhoneticsPreference(
  { config: { phoneticsPreference } }: UserState,
  action: UserStateAction
): PhoneticsPreference | null {
  if (action.type === "SET_PHONETICS_PREFERENCE") return action.newPreference;
  if (action.type === "REGISTER_GROUP_AND_APPLY_DEFAULTS")
    // if no preference, set to group default when a user registers
    return (
      phoneticsPreference ?? GROUPS[action.groupId].phoneticsPreference ?? null
    );
  else return phoneticsPreference;
}

function reduceWhereFound({config: {whereFound}}: UserState, action: UserStateAction
  ): string | null{
  if (action.type === "WHERE_FOUND") return action.whereFound;
  else return whereFound;
}

function reduceUserEmail(
  { config: { userEmail } }: UserState,
  action: UserStateAction
): string | null {
  if (action.type === "SET_USER_EMAIL") return action.newUserEmail;
  else return userEmail;
}

function reduceLessonCreationError(
  { ephemeral: { lessonCreationError } }: UserState,
  action: UserStateAction
): LessonCreationError | null {
  if (action.type === "LESSON_CREATE_ERROR") return action.error;
  else return lessonCreationError;
}

function reduceUserState(state: UserState, action: UserStateAction): UserState {
  // bail on individual resovlers if loading state
  if (action.type === "LOAD_STATE") return convertLegacyState(action.state);

  return {
    config: {
      sets: reduceUserSetsState(state, action),
      upstreamCollection: reduceUpstreamCollection(state, action),
      groupId: reduceGroupId(state, action),
      phoneticsPreference: reducePhoneticsPreference(state, action),
      userEmail: reduceUserEmail(state, action),
      whereFound: reduceWhereFound(state, action),
    },
    leitnerBoxes: reduceLeitnerBoxState(state, action),
    ephemeral: {
      lessonCreationError: reduceLessonCreationError(state, action),
    },
  };
}

function blankUserState(initializationProps: UserStateProps): UserState {
  return {
    config: {
      sets: {},
      upstreamCollection: null,
      groupId: null,
      phoneticsPreference: null,
      userEmail: null,
      whereFound: null,
    },
    ephemeral: {
      lessonCreationError: null,
    },
    leitnerBoxes: {
      numBoxes: initializationProps.leitnerBoxes.numBoxes,
      terms: {},
    },
  };
}

export function convertLegacyState(state: LegacyUserState): UserState {
  return {
    config: {
      sets: state.sets,
      groupId: state.groupId ?? null,
      phoneticsPreference: state.phoneticsPreference ?? null,
      upstreamCollection: state.upstreamCollection ?? null,
      userEmail: null,
      whereFound: null,
    },
    leitnerBoxes: state.leitnerBoxes,
    ephemeral: { lessonCreationError: state.lessonCreationError ?? null },
  };
}

/**
 * We don't really need the ephemeral parts to initialize the state
 */
type InitializerState = Omit<UserState, "ephemeral"> & {
  ephemeral?: UserState["ephemeral"];
};

function initializeUserState({
  storedUserState,
  initializationProps,
}: {
  storedUserState?: InitializerState;
  initializationProps: UserStateProps;
}): UserState {
  // This blank state nonsense ensures undefined and missing properties are upgraded to null
  const blankState = blankUserState(initializationProps);
  if (storedUserState)
    // deep assign to each slice
    return Object.fromEntries(
      Object.entries(blankState).map(([sliceKey, blankSlice]) => [
        sliceKey,
        Object.assign(
          blankSlice,
          Object.fromEntries(
            Object.entries(
              storedUserState[sliceKey as keyof UserState] ?? {}
            ).filter(([k, v]) => v !== undefined)
          )
        ),
      ])
    ) as UserState;
  else return blankState;
}

export function useUserState(props: {
  storedUserState?: InitializerState;
  initializationProps: UserStateProps;
}) {
  const [state, dispatch, dispatchImperativeBlock] = useReducerWithImperative(
    reduceUserState,
    props,
    initializeUserState
  );

  const userSetsInteractors = useUserSetsInteractors(
    state,
    dispatch,
    dispatchImperativeBlock
  );

  const lessonsInteractors = useLessonInteractors(state, dispatch);

  const leitnerBoxesInteractors = useLeitnerBoxesInteractors(
    state,
    dispatch,
    dispatchImperativeBlock
  );

  const miscInteractors: MiscInteractors = useMemo(
    () => ({
      setUpstreamCollection(collectionId: string | null) {
        logEvent(analytics, "change_upstream_collection", {
          oldCollection: state.config.upstreamCollection,
          newCollection: collectionId,
        });
        dispatch({
          type: "SET_UPSTREAM_COLLECTION",
          newCollectionId: collectionId,
        });
      },
      registerGroup(groupId: string) {
        if (isGroupId(groupId)) {
          dispatch({
            type: "REGISTER_GROUP_AND_APPLY_DEFAULTS",
            groupId,
          });
        }
      },
      setWhereFound(whereFound: string){
        dispatch({
          type: "WHERE_FOUND",
          whereFound,
        })
      },
      loadState(state: LegacyUserState) {
        dispatch({
          type: "LOAD_STATE",
          state,
        });
        dispatch({ type: "HANDLE_SET_CHANGES" });
        localStorage.setItem("user-state", JSON.stringify(state));
        auth.currentUser &&
          uploadAllLessonDataFromLocalStorage(auth.currentUser);
      },
      setPhoneticsPreference(newPreference) {
        logEvent(analytics, "change_phonetics_preference", {
          oldPreference: state.config.phoneticsPreference,
          newPreference,
        });
        dispatch({
          type: "SET_PHONETICS_PREFERENCE",
          newPreference,
        });
      },
      setUserEmail(newUserEmail) {
        logEvent(analytics, "set_user_email");
        dispatch({
          type: "SET_USER_EMAIL",
          newUserEmail,
        });
      },
    }),
    []
  );

  useEffect(() => {
    // handle resizes in number of boxes if we ever deploy them
    if (
      state.leitnerBoxes.numBoxes !==
      props.initializationProps.leitnerBoxes.numBoxes
    )
      leitnerBoxesInteractors.resize(
        props.initializationProps.leitnerBoxes.numBoxes
      );

    if (state.config.groupId) {
      dispatch({
        groupId: state.config.groupId,
        type: "REGISTER_GROUP_AND_APPLY_DEFAULTS",
      });
    }

    dispatch({ type: "HANDLE_SET_CHANGES" });
  }, []);

  return {
    state,
    interactors: {
      ...userSetsInteractors,
      ...lessonsInteractors,
      ...leitnerBoxesInteractors,
      ...miscInteractors,
    },
    dispatch,
  };
}

// context provider
