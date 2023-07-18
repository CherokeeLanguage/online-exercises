import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { analytics, auth } from ".";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInAnonymously,
  User,
} from "firebase/auth";
import { LoadingPage } from "../components/Loader";
import { setUserId } from "firebase/analytics";
import { SignInPage } from "../views/signin/SignInPage";
import { Navigate } from "react-router-dom";

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
      console.log("User is not signed in");
      // signInAnonymously(auth).then((uc) => {});
    }
  }, [user]);
  // auth has not loaded
  if (user === undefined) {
    return (
      <LoadingPage>
        <p>Connecting...</p>
      </LoadingPage>
    );
  }
  // auth has loaded but user is not signed in
  else if (user === null) {
    return <Navigate to="/signin" />;
  }
  // auth has loaded and we have a user
  return (
    <authContext.Provider value={{ user }}>{children}</authContext.Provider>
  );
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

export function createGoogleProvider() {
  const provider = new GoogleAuthProvider();
  provider.addScope("https://www.googleapis.com/auth/userinfo.email");
  provider.addScope("https://www.googleapis.com/auth/userinfo.profile");
  return provider;
}
