import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { analytics, auth } from ".";
import { onAuthStateChanged, signInAnonymously, User } from "firebase/auth";
import { LoadingPage } from "../components/Loader";
import { setUserId } from "firebase/analytics";

export interface AuthContext {
  user: User;
}

const authContext = createContext<AuthContext | null>(null);

function useFirebaseUser() {
  /**
   * `User`: signed in user
   * `null`: user is not signed in
   * `undefined`: we haven't loaded yet
   */
  const [user, setUser] = useState<User | null | undefined>(undefined);
  useEffect(() => {
    return onAuthStateChanged(auth, (newUser) => {
      setUser(newUser);
      if (newUser) {
        setUserId(analytics, newUser.uid);
      }
    });
  });
  return user;
}

export function AuthProvider({ children }: { children?: ReactNode }) {
  const user = useFirebaseUser();
  useEffect(() => {
    // null means user is not signed in, but we have loaded the auth state
    if (user === null) {
      signInAnonymously(auth).then((uc) => {});
    }
  }, [user]);
  if (user)
    return (
      <authContext.Provider value={{ user }}>{children}</authContext.Provider>
    );
  else {
    return (
      <LoadingPage>
        <p>Connecting...</p>
      </LoadingPage>
    );
  }
}

export function useAuth(): AuthContext {
  const context = useContext(authContext);
  if (context === null) throw new Error("Must be used under an AuthProvider");
  return context;
}

export function MockAuthProvider({
  userId,
  children,
}: {
  userId: string;
  children?: ReactNode;
}) {
  return (
    <authContext.Provider value={{ user: { uid: userId } as User }}>
      {children}
    </authContext.Provider>
  );
}
