import React, { Dispatch, useMemo } from "react";
import { collections, VocabSet, vocabSets } from "../../data/vocabSets";
import { ImperativeBlock } from "../../utils/useReducerWithImperative";
import { UserState, UserStateAction } from "../UserStateProvider";

export interface UserSetData {
  setId: string;
  addedAt: number;
}

export type UserSetsState = Record<string, UserSetData>;

export function nextSetForCollection(
  state: UserSetsState,
  collectionId: string
): VocabSet | undefined {
  const collection = collections[collectionId];
  return collection.sets.find((set) => !(set.id in state.sets));
}

interface AddSetAction {
  type: "ADD_SET";
  setToAdd: string;
}

interface RemoveSetAction {
  type: "REMOVE_SET";
  setToRemove: string;
}

export type UserSetsAction = AddSetAction | RemoveSetAction;

export function reduceUserSetsState(
  sets: UserSetsState,
  action: UserSetsAction
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
        dispatchImperativeBlock((state, act) => {
          if (setId in state.sets) return state;
          const set = vocabSets[setId];
          return act([
            {
              slice: "LeitnerBoxes",
              action: {
                type: "add_new_terms",
                newTerms: set.terms,
              },
            },
            {
              slice: "UserSets",
              action: {
                type: "ADD_SET",
                setToAdd: setId,
              },
            },
          ]);
        });
      },
      removeSet(setId) {
        const setToRemove = vocabSets[setId];
        dispatchImperativeBlock((state, act) => {
          // we need to figure out which terms are used ONLY by the set we are removing
          // to do this, we remove any terms which appear in another set
          const termsUniqueToSet = Object.values(state.sets)
            // get all other sets
            .filter((stats) => stats.setId !== setId)
            // get terms for those sets
            .map((s) => vocabSets[s.setId].terms)
            // for each set of terms, remove all terms from the list of unique terms
            .reduce(
              (uniqueTerms, setTerms) =>
                // for each term in that set
                setTerms.reduce(
                  // drop that term from the list of unique terms, if it is in there
                  (uniqueTerms, potentialDuplicateTerm) =>
                    uniqueTerms.filter(
                      (term) => term !== potentialDuplicateTerm
                    ),
                  uniqueTerms
                ),
              setToRemove.terms // list of unique terms starts with all terms in set to delete
            );

          return act([
            {
              slice: "LeitnerBoxes",
              action: {
                type: "remove_terms",
                termsToRemove: termsUniqueToSet,
              },
            },
            {
              slice: "UserSets",
              action: {
                type: "REMOVE_SET",
                setToRemove: setId,
              },
            },
          ]);
        });
      },
    }),
    [dispatchImperativeBlock]
  );
}
