import { FormEvent, ReactElement, useState } from "react";
import { Title } from "../../components/Title";
import {
  Page,
  ScrollWrapper,
  PageContent,
  HeaderLabel,
  Form,
  FormSubmitButton,
} from "./common";
import { HanehldaHeader } from "../../components/HanehldaHeader";
import styled from "styled-components";
import { theme } from "../../theme";

export function CreateAccountPage(): ReactElement {
  return (
    <Page>
      <ScrollWrapper>
        <PageContent>
          <HanehldaHeader>
            <HeaderLabel>Account creation</HeaderLabel>
          </HanehldaHeader>
          <CreateAccountContent />
        </PageContent>
      </ScrollWrapper>
    </Page>
  );
}

const StyledWelcome = styled.h3`
  background: ${theme.hanehldaColors.DARK_RED};
  color: ${theme.colors.WHITE};
  border-radius: ${theme.borderRadii.md};
  font-family: "Inika", serif;
  font-size: 30px;
  padding: 20px 0;
  max-width: 600px;
  margin: auto;
`;

const StyledContent = styled.div`
  padding: 20px;
`;

const SignUpFrom = styled(Form)`
  max-width: 400px;
  margin: auto;
`;

function CreateAccountContent(): ReactElement {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  function signUp(e: FormEvent) {
    e.preventDefault();
  }
  return (
    <StyledContent>
      <StyledWelcome>Welcome to Hanehlda!</StyledWelcome>
      <p>
        This site helps users practice their Cherokee language skills in many
        different ways.
      </p>
      <strong>
        <p>First, you will need to set up an account!</p>
      </strong>
      <SignUpFrom onSubmit={signUp}>
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
        <FormSubmitButton style={{ marginTop: 20 }}>
          Create Account
        </FormSubmitButton>
      </SignUpFrom>
    </StyledContent>
  );
}
