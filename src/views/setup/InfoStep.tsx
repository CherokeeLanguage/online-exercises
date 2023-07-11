import {
  ChangeEvent,
  FormEvent,
  ReactElement,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  isPhoneticsPreference,
  PhoneticsPreference,
  PREFERENCE_LITERATES,
} from "../../state/reducers/phoneticsPreference";

import { GROUPS, isGroupId } from "../../state/reducers/groupId";
import { Step, wizardContext } from "./SetupWizard";

export const InfoStep: Step = {
  name: "Info",
  Component: Info,
};

function Info(): ReactElement {
  const { finishInfo } = useContext(wizardContext);
  const [phoneticsPreference, setPhoneticsPreference] =
    useState<PhoneticsPreference>();
  const [whereFound, setWhereFound] = useState<string>();

  function onPreferenceChanged(e: ChangeEvent<HTMLInputElement>) {
    const phoneticsPreference = e.target.value;
    if (isPhoneticsPreference(phoneticsPreference))
      setPhoneticsPreference(phoneticsPreference);
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (phoneticsPreference && whereFound)
      finishInfo({ whereFound, phoneticsPreference });
  }

  // useEffect(() => {
  //   if (!phoneticsPreference) {
  //     const defaultPhoneticsPreference =
  //       groupId && isGroupId(groupId)
  //         ? GROUPS[groupId].phoneticsPreference
  //         : undefined;
  //     if (defaultPhoneticsPreference) {
  //       setWizardStatePhoneticsPreference(defaultPhoneticsPreference);
  //       setEnbabled(true);
  //     }
  //   }
  // }, [phoneticsPreference]);

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
                onChange={onPreferenceChanged}
              />
              <label htmlFor={value}>{literate}</label>
            </div>
          ))}
        </fieldset>
        {/* <NavigationButtons
          goToPreviousStep={goToPreviousStep}
          goToNextStep={goToNextStep}
          disabled={!enabled}
        /> */}
      </form>
    </div>
  );
}
