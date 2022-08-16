import React, { ReactElement, ReactNode, useContext, useEffect } from "react";
import { useLocalStorage } from "react-use";
import {
  LessonsAction,
  LessonsInteractors,
  LessonsState,
  reduceLessonsState,
  useLessonsInteractors,
} from "./reducers/lessons";
import {
  LeitnerBoxAction,
  LeitnerBoxesInteractors,
  LeitnerBoxState,
  reduceLeitnerBoxState,
  useLeitnerBoxesInteractors,
} from "./reducers/leitnerBoxes";
import { useReducerWithImperative } from "../utils/useReducerWithImperative";
import {
  reduceUserSetsState,
  UserSetsAction,
  UserSetsInteractors,
  UserSetsState,
  useUserSetsInteractors,
} from "./reducers/userSets";

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
  /** Sets the user is learning */
  sets: UserSetsState;
  /** The collection from which new sets should be pulled when the user is ready for new terms */
  upstreamCollection: string | undefined;
}

export type UserInteractors = UserSetsInteractors &
  LessonsInteractors &
  LeitnerBoxesInteractors;

export type UserStateAction =
  | {
      slice: "LeitnerBoxes";
      action: LeitnerBoxAction;
    }
  | {
      slice: "Lessons";
      action: LessonsAction;
    }
  | {
      slice: "UserSets";
      action: UserSetsAction;
    }
  | {
      slice: "UpstreamCollection";
      newCollectionId: string | undefined;
    };

function reduceUserState(state: UserState, action: UserStateAction): UserState {
  switch (action.slice) {
    case "LeitnerBoxes":
      return {
        ...state,
        leitnerBoxes: reduceLeitnerBoxState(state.leitnerBoxes, action.action),
      };
    case "Lessons":
      return {
        ...state,
        lessons: reduceLessonsState(state.lessons, action.action),
      };
    case "UserSets":
      return {
        ...state,
        sets: reduceUserSetsState(state.sets, action.action),
      };
    case "UpstreamCollection":
      return {
        ...state,
        upstreamCollection: action.newCollectionId,
      };
  }
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
