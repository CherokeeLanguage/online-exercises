import React, {
  ReactElement,
  ReactNode,
  useContext,
  useMemo,
  useEffect,
} from "react";
import { useLocalStorage } from "react-use";
import { GroupRegistrationModal } from "../components/GroupRegistrationModal";
import { LoadingPage } from "../components/Loader";
import { useAuth } from "../firebase/AuthProvider";
import {
  useFirebaseLeitnerBoxes,
  useFirebaseLocalStorageStateBackup,
  useFirebaseUserConfig,
} from "../firebase/hooks";
import { uploadAllLessonDataFromLocalStorage } from "../firebase/migration";
import { UserStateAction } from "../state/actions";
import { LeitnerBoxState } from "../state/reducers/leitnerBoxes";
import {
  UserState,
  UserInteractors,
  LegacyUserState,
  UserConfig,
  useUserState,
  convertLegacyState,
} from "../state/useUserState";

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
  const [localStorageStateBackup, setLocalStorageStateBackup] =
    useFirebaseLocalStorageStateBackup(user);

  useEffect(() => {
    // if there is no backup of the user's local storage state, upload whatever is in local storage
    if (
      localStorageStateBackup.ready &&
      localStorageStateBackup.data === null
    ) {
      if (localStorageUserState !== undefined)
        setLocalStorageStateBackup(localStorageUserState);
    }
  }, [localStorageStateBackup]);

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
    return (
      <LoadingPage>
        <p>Loading your data...</p>
      </LoadingPage>
    );
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
