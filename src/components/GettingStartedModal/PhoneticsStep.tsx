import { ChangeEvent, FormEvent, ReactElement, useEffect } from "react";
import { NavigationButtons, Step, StepProps } from ".";
import { Button } from "../Button";
import {
  isPhoneticsPreference,
  PhoneticsPreference,
  PREFERENCE_LITERATES,
} from "../../state/reducers/phoneticsPreference";
import { GROUPS, isGroupId } from "../../state/reducers/groupId";

export const PhoneticsStep: Step = {
  title: "Phonetics",
  commitState: ({ phoneticsPreference }, { setPhoneticsPreference }) => {
    setPhoneticsPreference(phoneticsPreference);
  },
  Component: PhoneticsStepComponent,
};

function PhoneticsStepComponent({
  wizardState: { phoneticsPreference, groupId },
  setWizardState,
  goToNextStep,
  goToPreviousStep,
}: StepProps): ReactElement {
  function setWizardStatePhoneticsPreference(
    newPhoneticsPreference: PhoneticsPreference
  ) {
    setWizardState((s) => ({
      ...s,
      phoneticsPreference: newPhoneticsPreference,
    }));
  }
  function onRadioChanged(e: ChangeEvent<HTMLInputElement>) {
    const phoneticsPreference = e.target.value;
    if (isPhoneticsPreference(phoneticsPreference))
      setWizardStatePhoneticsPreference(phoneticsPreference);
  }
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (phoneticsPreference) goToNextStep();
  }

  useEffect(() => {
    if (!phoneticsPreference) {
      const defaultPhoneticsPreference =
        groupId && isGroupId(groupId)
          ? GROUPS[groupId].phoneticsPreference
          : undefined;
      if (defaultPhoneticsPreference) {
        setWizardStatePhoneticsPreference(defaultPhoneticsPreference);
      }
    }
  }, [phoneticsPreference]);

  return (
    <div>
      <p>Select your phonetics preference!</p>

      <form onSubmit={onSubmit}>
        <fieldset>
          <legend>Phonetics preference</legend>
          {Object.entries(PREFERENCE_LITERATES).map(([value, literate], i) => (
            <div key={i}>
              <input
                type="radio"
                name="phoneticsPreference"
                value={value}
                id={value}
                checked={phoneticsPreference === value}
                onChange={onRadioChanged}
              />
              <label htmlFor={value}>{literate}</label>
            </div>
          ))}
        </fieldset>
        <NavigationButtons
          goToPreviousStep={goToPreviousStep}
          goToNextStep={goToNextStep}
          customNext={<Button as={"input"} type="submit" value="Next" />}
        />
      </form>
    </div>
  );
}
