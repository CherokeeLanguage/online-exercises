import {
  ChangeEvent,
  FormEvent,
  ReactElement,
  useId,
  useMemo,
  useState,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Button } from "../../components/Button";
import { useAnalyticsPageName } from "../../firebase/hooks";
import { lessonKey } from "../../state/reducers/lessons";
import { PhoneticsPreference } from "../../state/reducers/phoneticsPreference";
import { useUserStateContext } from "../../providers/UserStateProvider";
import { UserState } from "../../state/useUserState";
import { useAuth } from "../../firebase/AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { HanehldaView } from "../../components/HanehldaView";
import { DefaultNav } from "../../components/HanehldaView/HanehldaNav";
import { RadioBar } from "../../components/RadioBar";
import { cards } from "../../data/cards";
import { getPhonetics } from "../../utils/phonetics";
import { Hr } from "../setup/common";
import { theme } from "../../theme";
import { LessonsPath } from "../../routing/paths";

interface ExportedLessonData {
  lessonId: string;
  reviewedTerms: string | null;
  timings: string | null;
}

export function SettingsPage() {
  useAnalyticsPageName("Settings");
  return (
    <HanehldaView navControls={<DefaultNav />} collapseNav>
      <div>
        <Preferences />
        <hr />
        <UserIdentity />
        <hr />
        <LessonArchiveLink />
        <hr />
        <p>
          <em>
            If you have any questions please contact a maintainer at{" "}
            <BlueEm as="a" href="mailto:charliemcvicker@protonmail.com">
              charliemcvicker@protonmail.com
            </BlueEm>
          </em>
        </p>
      </div>
    </HanehldaView>
  );
}

const PreferencesForm = styled.form`
  display: grid;
  grid-template-columns: auto 1fr;
  grid-gap: 8px;
  text-align: center;
`;

function Preferences() {
  const {
    setPhoneticsPreference,
    config: { phoneticsPreference },
  } = useUserStateContext();

  const showTone = useMemo(
    () => phoneticsPreference === PhoneticsPreference.Detailed,
    [phoneticsPreference]
  );

  function onShowToneChanged(newValue: string) {
    const newPhoneticsPreference =
      newValue === "yes"
        ? PhoneticsPreference.Detailed
        : PhoneticsPreference.Simple;
    setPhoneticsPreference(newPhoneticsPreference);
  }

  const demoCard = useMemo(
    () => cards.find((c) => c.syllabary === "ᎠᏴᏓᏆᎶᏍᎩ")!,
    []
  );

  const phoneticsPreview = useMemo(
    () => getPhonetics(demoCard, phoneticsPreference),
    [phoneticsPreference]
  );

  return (
    <div>
      <h2>Preferences</h2>
      <PreferencesForm>
        <div>
          <RadioBar
            label="Would you like to see tone markings?"
            onChange={onShowToneChanged}
            value={showTone ? "yes" : "no"}
            options={[
              { value: "no", text: "No" },
              { value: "yes", text: "Yes" },
            ]}
          />
          <p>
            Example: <strong>{phoneticsPreview}</strong>
          </p>

          <p>
            <em>
              Tone is an important aspect of Cherokee, but can be daunting when
              you're just getting started. You can always change this setting
              later.
            </em>
          </p>
        </div>
      </PreferencesForm>
    </div>
  );
}

export const BlueEm = styled.em`
  font-style: normal;
  color: ${theme.hanehldaColors.DARK_BLUE};
`;

function UserIdentity(): ReactElement {
  const {
    config: { userEmail },
  } = useUserStateContext();
  const { user } = useAuth();
  return (
    <div>
      <h2>User identity</h2>
      <p>
        User id: <BlueEm as="code">{user.uid}</BlueEm>
      </p>
      <p>
        We have your email on file as: <BlueEm>{userEmail}</BlueEm>
      </p>
      {!user.isAnonymous && (
        <Button variant="negative" onClick={() => signOut(auth)}>
          Sign out
        </Button>
      )}
    </div>
  );
}

function LessonArchiveLink(): ReactElement {
  return (
    <div>
      <h2>Lesson history</h2>
      <p>You can browse previously completed lessons below.</p>
      <Button as={Link} to={LessonsPath} style={{ margin: 0, marginTop: -10 }}>
        View history
      </Button>
    </div>
  );
}
