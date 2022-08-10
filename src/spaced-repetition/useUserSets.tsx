import React, { ReactNode, useContext, useEffect, useReducer } from "react";
import { useLocalStorage } from "react-use";
import { collections, VocabSet, vocabSets } from "../data/vocabSets";
import { useLeitnerBoxContext } from "./LeitnerBoxProvider";

export interface UserSetData {
  setId: string;
  addedAt: number;
}

export interface UserSetsState {
  /** Sets the user has added */
  sets: Record<string, UserSetData>;
}

export interface UseUserSetsReturn extends UserSetsState {
  addSet: (setId: string) => void;
  removeSet: (setId: string) => void;
}

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

type UserSetsAction = AddSetAction | RemoveSetAction;

function reduceUserSets(
  state: UserSetsState,
  action: UserSetsAction
): UserSetsState {
  switch (action.type) {
    case "ADD_SET":
      return {
        sets: {
          ...state.sets,
          [action.setToAdd]: {
            setId: action.setToAdd,
            addedAt: Date.now(),
          },
        },
      };
    case "REMOVE_SET":
      return {
        sets: Object.fromEntries(
          Object.entries(state.sets).filter(
            ([setId, _]) => setId !== action.setToRemove
          )
        ),
      };
  }
}

/**
 * Internal hook used to manage user sets.
 *
 * Requires a LeitnerBoxContext.
 */
function useUserSets(localStorageKey: string): UseUserSetsReturn {
  const leitnerBoxes = useLeitnerBoxContext();
  const [storedUserSets, setStoredUserSets] = useLocalStorage<
    UserSetsState | undefined
  >(localStorageKey, undefined, {
    raw: false,
    serializer: JSON.stringify,
    deserializer: JSON.parse,
  });

  const [userSets, dispatch] = useReducer(
    reduceUserSets,
    storedUserSets ?? { sets: {} }
  );

  useEffect(() => setStoredUserSets(userSets), [userSets]);

  return {
    ...userSets,
    addSet(setId) {
      if (!(setId in userSets.sets)) {
        const set = vocabSets[setId];
        leitnerBoxes.addNewTerms(set.terms);
        dispatch({
          type: "ADD_SET",
          setToAdd: setId,
        });
      }
    },
    removeSet(setId) {
      const setToRemove = vocabSets[setId];
      // we need to figure out which terms are used ONLY by the set we are removing
      // to do this, we remove any terms which appear in another set
      const termsUniqueToSet = Object.values(userSets.sets)
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
                uniqueTerms.filter((term) => term !== potentialDuplicateTerm),
              uniqueTerms
            ),
          setToRemove.terms // list of unique terms starts with all terms in set to delete
        );

      leitnerBoxes.removeTerms(termsUniqueToSet);

      dispatch({
        type: "REMOVE_SET",
        setToRemove: setId,
      });
    },
  };
}

const userSetsContext = React.createContext<UseUserSetsReturn | null>(null);

export function UserSetsProvider({ children }: { children: ReactNode }) {
  const value = useUserSets("user-sets");
  return (
    <userSetsContext.Provider value={value}>
      {children}
    </userSetsContext.Provider>
  );
}

export function useUserSetsContext(): UseUserSetsReturn {
  const value = useContext(userSetsContext);
  if (!value) throw new Error("Must be used under a UserSetsProvider");
  return value;
}
