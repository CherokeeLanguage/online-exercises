import { ReactElement, ReactNode } from "react";
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
        <FormSubmitButton>Sign in</FormSubmitButton>
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
  function signUpWithGoogle() {
    // TODO
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
