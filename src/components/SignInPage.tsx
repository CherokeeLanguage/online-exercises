import { FormEvent, ReactElement, ReactNode } from "react";
import styled from "styled-components";
import { theme } from "../theme";
import { Title } from "./Title";
import { FcGoogle } from "react-icons/fc";
import { TfiEmail } from "react-icons/tfi";
import { IconType } from "react-icons";

const Page = styled.div`
  height: 100vh;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  background-color: ${theme.hanehldaColors.CREAM};
`;

const ScrollWrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  height: 100%;
  overflow-x: auto;
`;

const PageContent = styled.div`
  flex: 1;
  /* max-width: min(800px, 100vw); */
  margin: 0 auto;
  text-align: center;
  display: grid;
  grid-template-rows: auto auto min(1fr, 300px);
`;

export function SignInPage(): ReactElement {
  return (
    <Page>
      <ScrollWrapper>
        <PageContent>
          <Title />
          <SignInContent />
          <CreateAccountSection />
        </PageContent>
      </ScrollWrapper>
    </Page>
  );
}

const SignInButton = styled.button`
  text-transform: uppercase;

  box-sizing: border-box;

  background: #ffea9f;
  border: 1px solid #000000;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 30px;

  font-family: "Inika";
  font-style: normal;
  font-weight: 700;
  font-size: 40px;
  line-height: 52px;
  text-align: center;

  color: #464d50;

  display: block;
  width: 100%;
`;

const StyledSignInMethodButton = styled.button`
  border-radius: ${theme.borderRadii.md};
  outline: none;
  background-color: ${theme.colors.WHITE};
  border: 1px solid ${theme.hanehldaColors.BORDER_GRAY};
  width: 100%;

  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;

  color: ${theme.hanehldaColors.TEXT_LIGHT_GRAY};
  font-size: ${theme.fontSizes.md};
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
      <Icon size="2em" style={{ padding: 12 }} />
      <div>{children}</div>
    </StyledSignInMethodButton>
  );
}

const StyledSignInContent = styled.div`
  max-width: 420px;
  margin: auto;
  color: ${theme.hanehldaColors.TEXT_LIGHT_GRAY};
  font-size: ${theme.fontSizes.md};
  & > span {
    margin: 8px 0;
    display: block;
    color: #787b77;
  }
`;

const Form = styled.form`
  input {
    margin: 6px 0;
    box-sizing: border-box;
    border-radius: ${theme.borderRadii.md};
    outline: none;
    background-color: ${theme.colors.WHITE};
    border: 1px solid ${theme.hanehldaColors.BORDER_GRAY};
    width: 100%;
    padding: 16px;
    color: ${theme.hanehldaColors.TEXT_LIGHT_GRAY};
    font-size: ${theme.fontSizes.md};
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

export function SignInContent(): ReactElement {
  function signInWithGoogle() {
    // TODO
  }
  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO
  }
  return (
    <StyledSignInContent>
      <SignInMethodButton Icon={FcGoogle} onClick={signInWithGoogle}>
        Sign in with Google
      </SignInMethodButton>
      <span>or</span>
      <Form onSubmit={onSubmit}>
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Password" />
        <ForgotPasswordButton>Forgot your password?</ForgotPasswordButton>
        <SignInButton>Sign in</SignInButton>
      </Form>
    </StyledSignInContent>
  );
}

const StyledCreateAccountSection = styled.div`
  background: ${theme.hanehldaColors.LIGHT_RED};
  position: relative;
  margin-top: 55px;
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
  display: flex;
  align-items: center;
  gap: 16px;
  justify-content: center;
`;

function CreateAccountSection() {
  function signUpWithGoogle() {
    // TODO
  }
  function signUpWithEmail() {
    // TODO
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
