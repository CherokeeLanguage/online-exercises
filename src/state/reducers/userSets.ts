import React, { Dispatch, useMemo } from "react";
import { ImperativeBlock } from "../../utils/useReducerWithImperative";
import { UserState } from "../UserStateProvider";
import { UserStateAction } from "../actions";

export interface UserSetData {
  setId: string;
  addedAt: number;
}

export type UserSetsState = Record<string, UserSetData>;

export function reduceUserSetsState(
  { config: { sets } }: UserState,
  action: UserStateAction
): UserSetsState {
  switch (action.type) {
    case "ADD_SET":
      return {
        ...sets,
        [action.setToAdd]: {
          setId: action.setToAdd,
          addedAt: Date.now(),
        },
      };
    case "REMOVE_SET":
      return Object.fromEntries(
        Object.entries(sets).filter(
          ([setId, _]) => setId !== action.setToRemove
        )
      );
  }
  return sets;
}

export interface UserSetsInteractors {
  addSet: (setId: string) => void;
  removeSet: (setId: string) => void;
}

/**
 * Create
 */
export function useUserSetsInteractors(
  state: UserState,
  dispatch: Dispatch<UserStateAction>,
  dispatchImperativeBlock: Dispatch<ImperativeBlock<UserState, UserStateAction>>
): UserSetsInteractors {
  return useMemo(
    () => ({
      addSet(setId) {
        dispatch({
          type: "ADD_SET",
          setToAdd: setId,
        });
      },
      removeSet(setId) {
        dispatch({
          type: "REMOVE_SET",
          setToRemove: setId,
        });
      },
    }),
    []
  );
}
