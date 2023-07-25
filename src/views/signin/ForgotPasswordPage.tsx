import { FormEvent, ReactElement, useContext, useState } from "react";
import { Form, FormSubmitButton } from "./common";
import { HeaderLabel } from "../../components/HanehldaView/HanehldaHeader";
import styled from "styled-components";
import { theme } from "../../theme";
import { AuthErrorCodes, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase";
import { Link, useNavigate } from "react-router-dom";
import { FirebaseError } from "firebase/app";
import {
  StatusBanner,
  StatusBannerProvider,
  statusBannerContext,
} from "../../components/StatusBannerProvider";
import { HanehldaView } from "../../components/HanehldaView";

export function ForgotPasswordPage(): ReactElement {
  return (
    <HanehldaView navControls={<HeaderLabel>Forgot password</HeaderLabel>}>
      <StatusBannerProvider>
        <CreateAccountContent />
      </StatusBannerProvider>
    </HanehldaView>
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

function CreateAccountContent(): ReactElement {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const { setError, setStatus } = useContext(statusBannerContext);
  function signUp(e: FormEvent) {
    e.preventDefault();
    sendPasswordResetEmail(auth, email)
      .then((cred) => {
        console.log(cred);
        setStatus({
          type: "success",
          node: (
            <span>
              A password reset email has been sent. Follow the instructions, and
              then <Link to="/signin">sign in</Link>.
            </span>
          ),
        });
        // navigate("/");
      })
      .catch((err: FirebaseError) => {
        console.log(err);
        if (err.code === AuthErrorCodes.USER_DELETED) {
          setError(
            <span>
              There is no account with that email. Please double check the email
              address.
            </span>
          );
        } else {
          setError(
            <span>
              Something went wrong. You can contact an administator at{" "}
              <a href="mailto:charliemcvicker@protonmail.com">
                charliemcvicker@protonmail.com
              </a>
            </span>
          );
        }
      });
  }
  return (
    <StyledContent>
      <StyledWelcome>Forgot your password?</StyledWelcome>
      <p>
        Enter your email below and we will send you a link to reset your
        password.
      </p>
      <StatusBanner />
      <Form standalone onSubmit={signUp}>
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <FormSubmitButton style={{ marginTop: 20 }}>
          Reset password
        </FormSubmitButton>
      </Form>
    </StyledContent>
  );
}
