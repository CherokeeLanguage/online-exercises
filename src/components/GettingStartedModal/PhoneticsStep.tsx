import { ChangeEvent, FormEvent, ReactElement, useEffect, useState } from "react";
import { NavigationButtons, Step, StepProps } from ".";
import { Button } from "../Button";
import {
  isPhoneticsPreference,
  PhoneticsPreference,
  PREFERENCE_LITERATES,
} from "../../state/reducers/phoneticsPreference";

import { GROUPS, isGroupId } from "../../state/reducers/groupId";

export const PhoneticsStep: Step = {
  /*
   * Sets the phonetic preference to the wizard state.
   */
  title: "Phonetics",
  commitState: ({ phoneticsPreference }, { setPhoneticsPreference }) => {
    if (phoneticsPreference) { setPhoneticsPreference(phoneticsPreference); }
  },
  Component: PhoneticsStepComponent,
};

function PhoneticsStepComponent({
  /*
   * Defines the phonetics step. Allows user to set phonetics preference, advance to the next step, or go to the previous step. Offers a default preference.
   */
  wizardState: { phoneticsPreference, groupId },
  setWizardState,
  goToNextStep,
  goToPreviousStep,
}: StepProps): ReactElement {
  const [enabled, setEnbabled] = useState(phoneticsPreference != undefined); 
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
      setEnbabled(true); 
  }
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (phoneticsPreference && goToNextStep) goToNextStep();
  }

  useEffect(() => {
    if (!phoneticsPreference) {
      const defaultPhoneticsPreference =
        groupId && isGroupId(groupId)
          ? GROUPS[groupId].phoneticsPreference
          : undefined;
      if (defaultPhoneticsPreference) {
        setWizardStatePhoneticsPreference(defaultPhoneticsPreference);
        setEnbabled(true); 
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
          disabled ={!enabled}
        />
      </form>
    </div>
  );
}
