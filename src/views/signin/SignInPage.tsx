import { ReactElement, ReactNode, useContext, useState } from "react";
import styled from "styled-components";
import { devices, theme } from "../../theme";
import { Title } from "../../components/Title";
import { FcGoogle } from "react-icons/fc";
import { TfiEmail } from "react-icons/tfi";
import { IconType } from "react-icons";
import {
  Page,
  ScrollWrapper,
  PageContent,
  Form,
  FormSubmitButton,
} from "./common";
import { useNavigate } from "react-router-dom";
import {
  AuthErrorCodes,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../../firebase";
import { createGoogleProvider } from "../../firebase/AuthProvider";
import { FirebaseError } from "firebase/app";
import {
  StatusBanner,
  StatusBannerProvider,
  statusBannerContext,
} from "../../components/StatusBannerProvider";

export function SignInPage(): ReactElement {
  return (
    <Page>
      <ScrollWrapper>
        <PageContent>
          <StatusBannerProvider>
            <StatusBanner />
            <Title />
            <SignInContent />
            <CreateAccountSection />
          </StatusBannerProvider>
        </PageContent>
      </ScrollWrapper>
    </Page>
  );
}

const StyledSignInMethodButton = styled.button`
  box-sizing: border-box;
  border-radius: ${theme.borderRadii.md};
  outline: none;
  background-color: ${theme.colors.WHITE};
  border: 1px solid ${theme.hanehldaColors.BORDER_GRAY};
  width: 100%;

  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;

  /* color: ${theme.hanehldaColors.TEXT_LIGHT_GRAY}; */
  font-size: ${theme.fontSizes.md};

  padding: 4px;

  @media ${devices.tablet} {
    padding: 8px;
  }
`;

function SignInMethodButton({
  Icon,
  children,
  onClick,
}: {
  Icon: IconType;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <StyledSignInMethodButton onClick={onClick}>
      <Icon size="2em" style={{ padding: 4 }} />
      <div>{children}</div>
    </StyledSignInMethodButton>
  );
}

const StyledSignInContent = styled.div`
  max-width: 100%;
  @media ${devices.tablet} {
    max-width: 420px;
  }
  margin: auto;
  padding: 32px;
  color: ${theme.hanehldaColors.TEXT_LIGHT_GRAY};
  font-size: ${theme.fontSizes.md};
  & > span {
    margin: 8px 0;
    display: block;
    color: #787b77;
  }
`;

const ForgotPasswordButton = styled.button`
  color: ${theme.hanehldaColors.TEXT_LIGHT_GRAY};
  outline: none;
  border: none;
  text-decoration: underline;
  background: none;
  margin: 8px;
  color: #787b77;
`;

function SignInContent(): ReactElement {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setError } = useContext(statusBannerContext);
  function signInWithGoogle() {
    signInWithPopup(auth, createGoogleProvider())
      .then((res) => {
        navigate("/");
      })
      .catch((err: FirebaseError) => {
        if (err.code === AuthErrorCodes.EMAIL_EXISTS) {
          setError(
            "You have another account with that email address. Try signing in with an email and password below."
          );
        } else {
          setError(
            "Something went wrong. You can try again or contact an administrator for help."
          );
        }
      });
  }
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then((c) => navigate("/"))
      .catch((err) => {
        if (err instanceof FirebaseError) {
          switch (err.code) {
            case AuthErrorCodes.USER_DELETED:
              setError("Email address not found");
              return;
            case AuthErrorCodes.INVALID_PASSWORD:
              setError("Double check your email and password");
              return;
          }
        }
        setError("Something when wrong");
      });
  }
  return (
    <StyledSignInContent>
      <SignInMethodButton Icon={FcGoogle} onClick={signInWithGoogle}>
        Sign in with Google
      </SignInMethodButton>
      <span>or</span>
      <Form onSubmit={onSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <ForgotPasswordButton
          type="button"
          onClick={() => navigate("/signin/forgot-password")}
        >
          Forgot your password?
        </ForgotPasswordButton>
        <FormSubmitButton type="submit">Sign in</FormSubmitButton>
      </Form>
    </StyledSignInContent>
  );
}

const StyledCreateAccountSection = styled.div`
  background: ${theme.hanehldaColors.LIGHT_RED};
  position: relative;
  margin-top: 20px;
  padding: 40px;
  padding-top: 0;
  border-top: 4px solid ${theme.hanehldaColors.DARK_RED};
  h2 {
    transform: translateY(-50%) translateY(-4px);
    max-width: 250px;
    margin: auto;
    background: ${theme.hanehldaColors.DARK_RED};
    color: ${theme.colors.WHITE};
    font-size: 40px;
    border-radius: ${theme.borderRadii.md};
  }
`;

const CreateAccountOptions = styled.div`
  & > span {
    margin: 12px 0;
    display: block;
  }
  @media ${devices.tablet} {
    display: flex;
    align-items: center;
    gap: 16px;
    justify-content: center;
  }
`;

function CreateAccountSection() {
  const navigate = useNavigate();
  const { setError } = useContext(statusBannerContext);
  function signUpWithGoogle() {
    signInWithPopup(auth, createGoogleProvider())
      .then((res) => {
        navigate("/");
      })
      .catch((err: FirebaseError) => {
        if (err.code === AuthErrorCodes.EMAIL_EXISTS) {
          setError(
            "You have another account with that email address. Try signing in with an email and password below."
          );
        } else {
          setError(
            "Something went wrong. You can try again or contact an administrator for help."
          );
        }
      });
  }
  function signUpWithEmail() {
    navigate("/signin/new");
  }
  return (
    <StyledCreateAccountSection>
      <h2>New?</h2>
      <CreateAccountOptions>
        <span>
          <SignInMethodButton Icon={FcGoogle} onClick={signUpWithGoogle}>
            Create an account with Google
          </SignInMethodButton>
        </span>
        <span>or</span>
        <span>
          <SignInMethodButton Icon={TfiEmail} onClick={signUpWithEmail}>
            Create an account with email
          </SignInMethodButton>
        </span>
      </CreateAccountOptions>
    </StyledCreateAccountSection>
  );
}
