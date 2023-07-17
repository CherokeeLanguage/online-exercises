import { FormEvent, ReactElement, useContext, useMemo, useState } from "react";
import { PhoneticsPreference } from "../../state/reducers/phoneticsPreference";

import { Step, wizardContext } from "./SetupWizard";
import { Form, FormSubmitButton } from "../signin/common";
import { RadioBar } from "../../components/RadioBar";
import { getPhonetics } from "../../utils/phonetics";
import { cards } from "../../data/cards";
import { BackButton, Hr, NavigationButtons, NextButton } from "./common";

export const InfoStep: Step = {
  name: "Info",
  Component: Info,
};

function Info(): ReactElement {
  const {
    finishInfo,
    state: {
      data: {
        phoneticsPreference: initialPhoneticsPreference,
        whereFound: initialWhereFound,
      },
    },
  } = useContext(wizardContext);
  const [showTone, setShowTone] = useState<boolean>(
    initialPhoneticsPreference
      ? initialPhoneticsPreference === PhoneticsPreference.Detailed
      : true
  );
  const [whereFound, setWhereFound] = useState<string | undefined>(
    initialWhereFound
  );

  const phoneticsPreference = useMemo(
    () =>
      showTone ? PhoneticsPreference.Detailed : PhoneticsPreference.Simple,
    [showTone]
  );

  function onShowToneChanged(newValue: string) {
    setShowTone(newValue === "yes");
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (phoneticsPreference && whereFound)
      finishInfo({ whereFound, phoneticsPreference });
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
      <p>
        <strong>We need to ask a couple questions to get started...</strong>
      </p>

      <Hr />
      <Form standalone onSubmit={onSubmit}>
        <div>
          <label htmlFor="whereFound">Where did you hear about Hanehlda?</label>
          <input
            name="whereFound"
            type="text"
            placeholder="Facebook, word-of-mouth, etc."
            value={whereFound}
            onChange={(e) => setWhereFound(e.target.value)}
            required
          />
        </div>
        <Hr />
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
        {/* <NavigationButtons
          goToPreviousStep={goToPreviousStep}
          goToNextStep={goToNextStep}
          disabled={!enabled}
        /> */}
        {/* <FormSubmitButton type="submit">Move on</FormSubmitButton> */}
        <NavigationButtons
          left={<BackButton />}
          right={<NextButton type="submit">Continue</NextButton>}
        />
      </Form>
    </div>
  );
}
