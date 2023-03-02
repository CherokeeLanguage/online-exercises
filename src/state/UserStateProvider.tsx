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
  reduceLessonsState,
  useLessonsInteractors,
} from "./reducers/lessons";
import {
  LeitnerBoxesInteractors,
  LeitnerBoxState,
  reduceLeitnerBoxState,
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

export interface UserStateProps {
  leitnerBoxes: {
    numBoxes: number;
  };
}

export interface UserState {
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
}

interface MiscInteractors {
  setUpstreamCollection: (collectionId: string) => void;
  registerGroup: (groupId: string) => void;
  setPhoneticsPreference: (newPreference: PhoneticsPreference) => void;
  loadState: (state: UserState) => void;
}

export type UserInteractors = UserSetsInteractors &
  LessonsInteractors &
  LeitnerBoxesInteractors &
  MiscInteractors;

function reduceUpstreamCollection(
  { upstreamCollection }: UserState,
  action: UserStateAction
): string | undefined {
  if (action.type === "SET_UPSTREAM_COLLECTION") return action.newCollectionId;
  if (action.type === "REGISTER_GROUP_AND_APPLY_DEFAULTS")
    // if no upstream collection, set to group default
    return upstreamCollection ?? GROUPS[action.groupId].defaultCollectionId;
  else return upstreamCollection;
}

function reducePhoneticsPreference(
  state: UserState,
  action: UserStateAction
): PhoneticsPreference | undefined {
  if (action.type === "SET_PHONETICS_PREFERENCE") return action.newPreference;
  if (action.type === "REGISTER_GROUP_AND_APPLY_DEFAULTS")
    // if no preference, set to group default when a user registers
    return (
      state.phoneticsPreference ?? GROUPS[action.groupId].phoneticsPreference
    );
  else return state.phoneticsPreference;
}

function reduceLessonCreationError(
  { lessonCreationError }: UserState,
  action: UserStateAction
): LessonCreationError | undefined {
  if (action.type === "LESSON_CREATE_ERROR") return action.error;
  else return lessonCreationError;
}

function reduceUserState(state: UserState, action: UserStateAction): UserState {
  // bail on individual resovlers if loading state
  if (action.type === "LOAD_STATE") return action.state;

  return {
    leitnerBoxes: reduceLeitnerBoxState(state, action),
    lessons: reduceLessonsState(state, action),
    sets: reduceUserSetsState(state, action),
    upstreamCollection: reduceUpstreamCollection(state, action),
    lessonCreationError: reduceLessonCreationError(state, action),
    groupId: reduceGroupId(state, action),
    phoneticsPreference: reducePhoneticsPreference(state, action),
  };
}

function initializeUserState({
  storedUserState,
  initializationProps,
}: {
  storedUserState?: UserState;
  initializationProps: UserStateProps;
}): UserState {
  if (storedUserState) return storedUserState;
  else
    return {
      lessons: {},
      sets: {},
      leitnerBoxes: {
        numBoxes: initializationProps.leitnerBoxes.numBoxes,
        terms: {},
      },
      upstreamCollection: undefined,
      lessonCreationError: undefined,
      groupId: undefined,
      phoneticsPreference: undefined,
    };
}

export function useUserState(props: {
  storedUserState?: UserState;
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

  const lessonsInteractors = useLessonsInteractors(
    state,
    dispatch,
    dispatchImperativeBlock
  );

  const leitnerBoxesInteractors = useLeitnerBoxesInteractors(
    state,
    dispatch,
    dispatchImperativeBlock
  );

  const miscInteractors: MiscInteractors = useMemo(
    () => ({
      setUpstreamCollection(collectionId: string | undefined) {
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
      loadState(state: UserState) {
        dispatch({
          type: "LOAD_STATE",
          state,
        });
        dispatch({ type: "HANDLE_SET_CHANGES" });
      },
      setPhoneticsPreference(newPreference) {
        dispatch({
          type: "SET_PHONETICS_PREFERENCE",
          newPreference,
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
    if (state.groupId) {
      dispatch({
        groupId: state.groupId,
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
  };
}

// context provider

export interface UserStateContext extends UserState, UserInteractors {}

const userStateContext = React.createContext<UserStateContext | null>(null);

export function UserStateProvider({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const [storedUserState, setStoredUserState] = useLocalStorage<UserState>(
    "user-state",
    undefined,
    {
      raw: false,
      serializer: JSON.stringify,
      deserializer: (s) => JSON.parse(s.normalize("NFD")), // ensure everything is NFD!
    }
  );

  const { state, interactors } = useUserState({
    storedUserState,
    initializationProps: {
      leitnerBoxes: {
        numBoxes: 6,
      },
    },
  });

  useEffect(() => {
    setStoredUserState(state);
  }, [state]);

  return (
    <userStateContext.Provider value={{ ...state, ...interactors }}>
      {children}
      {state.groupId === undefined && (
        <GroupRegistrationModal registerGroup={interactors.registerGroup} />
      )}
    </userStateContext.Provider>
  );
}

export function useUserStateContext(): UserStateContext {
  const value = useContext(userStateContext);
  if (value === null) throw new Error("Must be used under a UserStateProvider");
  return value;
}
