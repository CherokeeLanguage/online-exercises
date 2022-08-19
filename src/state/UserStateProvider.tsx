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
}

interface MiscInteractors {
  setUpstreamCollection: (collectionId: string) => void;
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
  else return upstreamCollection;
}

function reduceLessonCreationError(
  { lessonCreationError }: UserState,
  action: UserStateAction
): LessonCreationError | undefined {
  if (action.type === "LESSON_CREATE_ERROR") return action.error;
  else return lessonCreationError;
}

function reduceUserState(state: UserState, action: UserStateAction): UserState {
  return {
    leitnerBoxes: reduceLeitnerBoxState(state, action),
    lessons: reduceLessonsState(state, action),
    sets: reduceUserSetsState(state, action),
    upstreamCollection: reduceUpstreamCollection(state, action),
    lessonCreationError: reduceLessonCreationError(state, action),
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
    };
}

export function useUserState(initializationProps: UserStateProps) {
  const [storedUserState, setStoredUserState] = useLocalStorage<UserState>(
    "user-state",
    undefined,
    {
      raw: false,
      serializer: JSON.stringify,
      deserializer: JSON.parse,
    }
  );

  const [state, dispatch, dispatchImperativeBlock] = useReducerWithImperative(
    reduceUserState,
    { storedUserState, initializationProps },
    initializeUserState
  );

  useEffect(() => {
    setStoredUserState(state);
  }, [state]);

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
    }),
    []
  );

  useEffect(() => {
    // handle resizes in number of boxes if we ever deploy them
    if (
      state.leitnerBoxes.numBoxes !== initializationProps.leitnerBoxes.numBoxes
    )
      leitnerBoxesInteractors.resize(initializationProps.leitnerBoxes.numBoxes);
  }, []);

  return {
    ...state,
    ...userSetsInteractors,
    ...lessonsInteractors,
    ...leitnerBoxesInteractors,
    ...miscInteractors,
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
  const value = useUserState({
    leitnerBoxes: {
      numBoxes: 6,
    },
  });
  return (
    <userStateContext.Provider value={value}>
      {children}
    </userStateContext.Provider>
  );
}

export function useUserStateContext(): UserStateContext {
  const value = useContext(userStateContext);
  if (value === null) throw new Error("Must be used under a UserStateProvider");
  return value;
}
