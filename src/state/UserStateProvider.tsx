import React, {
  ReactElement,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { useLocalStorage } from "react-use";
import {
  LessonsInteractors,
  LessonsState,
  useLessonInteractors,
} from "./reducers/lessons";
import {
  LeitnerBoxesInteractors,
  LeitnerBoxState,
  reduceLeitnerBoxState,
  ReviewResult,
  useLeitnerBoxesInteractors,
} from "./reducers/leitnerBoxes";
import { useReducerWithImperative } from "../utils/useReducerWithImperative";
import {
  reduceUserSetsState,
  UserSetsInteractors,
  UserSetsState,
  useUserSetsInteractors,
} from "./reducers/userSets";
import { UserStateAction } from "./actions";
import { LessonCreationError } from "./reducers/lessons/createNewLesson";
import { GroupId, GROUPS, isGroupId, reduceGroupId } from "./reducers/groupId";
import { GroupRegistrationModal } from "../components/GroupRegistrationModal";
import { PhoneticsPreference } from "./reducers/phoneticsPreference";
import {
  useFirebaseUserConfig,
  useFirebaseLeitnerBoxes,
} from "../firebase/hooks";
import { analytics, auth } from "../firebase";
import { logEvent } from "firebase/analytics";
import { useAuth } from "../firebase/AuthProvider";
import { child, DatabaseReference, set } from "firebase/database";
import {
  lessonMetadataPath,
  lessonReviewedTermsPath,
  setTyped,
} from "../firebase/paths";
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

function convertLegacyState(state: LegacyUserState): UserState {
  return {
    config: {
      sets: state.sets,
      groupId: state.groupId ?? null,
      phoneticsPreference: state.phoneticsPreference ?? null,
      upstreamCollection: state.upstreamCollection ?? null,
      userEmail: null,
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

export interface UserStateContext extends UserState, UserInteractors {
  dispatch: React.Dispatch<UserStateAction>;
}

const userStateContext = React.createContext<UserStateContext | null>(null);

export interface UserStatePersistenceContext {
  // browser stored state
  localStorageUserState?: LegacyUserState;
  flagLocalStateAndUploadLessons: () => void;
  // -- Firebase slices --
  // config
  config: UserConfig | null;
  setConfig: (newConfig: UserConfig) => void;
  // leitner boxes
  leitnerBoxes: LeitnerBoxState | null;
  setLeitnerBoxes: (newLeitnerBoxes: LeitnerBoxState) => void;
}
export const userStatePersistenceContext =
  React.createContext<UserStatePersistenceContext | null>(null);

function UserStatePersistenceProvider({
  children,
}: {
  children: ReactElement;
}) {
  const { user } = useAuth();
  const [localStorageUserState, setLocalStorageUserState] =
    useLocalStorage<LegacyUserState>("user-state", undefined, {
      raw: false,
      serializer: JSON.stringify,
      deserializer: (s) => JSON.parse(s.normalize("NFD")), // ensure everything is NFD!
    });

  const [leitnerBoxes, setLeitnerBoxes] = useFirebaseLeitnerBoxes(user);
  const [config, setConfig] = useFirebaseUserConfig(user);

  if (config.ready && leitnerBoxes.ready) {
    return (
      <userStatePersistenceContext.Provider
        value={{
          localStorageUserState,
          flagLocalStateAndUploadLessons() {
            if (
              !localStorageUserState ||
              localStorageUserState.HAS_BEEN_UPLOADED
            )
              return;
            setLocalStorageUserState({
              ...localStorageUserState,
              HAS_BEEN_UPLOADED: true,
            });
            uploadAllLessonDataFromLocalStorage(user);
          },
          config: config.data,
          setConfig,
          leitnerBoxes: leitnerBoxes.data,
          setLeitnerBoxes,
        }}
      >
        {children}
      </userStatePersistenceContext.Provider>
    );
  } else {
    return <em>Loading...</em>;
  }
}

function WrappedUserStateProvider({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const persistenceContext = useContext(userStatePersistenceContext);
  if (persistenceContext === null) throw new Error("explode");
  const {
    localStorageUserState,
    flagLocalStateAndUploadLessons,
    config,
    setConfig,
    leitnerBoxes,
    setLeitnerBoxes,
  } = persistenceContext;

  const storedUserState = useMemo(() => {
    if (config === null || leitnerBoxes === null) {
      if (localStorageUserState === undefined) return undefined;
      flagLocalStateAndUploadLessons();
      return convertLegacyState(localStorageUserState);
    } else {
      return { config, leitnerBoxes };
    }
  }, [localStorageUserState, config, leitnerBoxes]);

  const { state, interactors, dispatch } = useUserState({
    storedUserState,
    initializationProps: {
      leitnerBoxes: {
        numBoxes: 6,
      },
    },
  });

  // sync segments of state independently
  useEffect(() => {
    setConfig(state.config);
  }, [state.config]);
  useEffect(() => {
    setLeitnerBoxes(state.leitnerBoxes);
  }, [state.leitnerBoxes]);

  return (
    <userStateContext.Provider value={{ ...state, ...interactors, dispatch }}>
      {children}
      {(state.config.userEmail === null || state.config.groupId === null) && (
        <GroupRegistrationModal />
      )}
    </userStateContext.Provider>
  );
}

export function UserStateProvider({ children }: { children?: ReactNode }) {
  return (
    <UserStatePersistenceProvider>
      <WrappedUserStateProvider>{children}</WrappedUserStateProvider>
    </UserStatePersistenceProvider>
  );
}

export function useUserStateContext(): UserStateContext {
  const value = useContext(userStateContext);
  if (value === null) throw new Error("Must be used under a UserStateProvider");
  return value;
}
