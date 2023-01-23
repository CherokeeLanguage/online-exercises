import { ChangeEvent, FormEvent } from "react";
import { NavigationButtons, Step, StepProps } from ".";
import { GROUPS } from "../../state/reducers/groupId";
import { Button } from "../Button";

export const GroupRegistrationStep: Step = {
  title: "Select your group...",
  Component: GroupRegistrationForm,
  commitState: ({ groupId }, { registerGroup }) => {
    registerGroup(groupId);
  },
};

export function GroupRegistrationForm({
  wizardState: { groupId },
  setWizardState,
  goToNextStep,
  goToPreviousStep,
}: StepProps) {
  function onRadioChanged(e: ChangeEvent<HTMLInputElement>) {
    const groupId = e.target.value;
    setWizardState((s) => ({ ...s, groupId }));
  }
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (groupId) goToNextStep();
  }
  return (
    <>
      <p>
        Please select the group you are registered with to use the app. If you
        are not part of any group, please choose the "Open beta" option.
      </p>
      <form onSubmit={onSubmit}>
        <fieldset>
          <legend>Group</legend>
          {Object.entries(GROUPS).map(([id, group]) => (
            <div key={id}>
              <input
                type="radio"
                name="groupId"
                value={id}
                id={id}
                checked={groupId === id}
                onChange={onRadioChanged}
              />
              <label htmlFor={id}>{group.name}</label>
            </div>
          ))}
        </fieldset>
        <NavigationButtons
          goToPreviousStep={goToPreviousStep}
          goToNextStep={goToNextStep}
          customNext={<Button as={"input"} type="submit" value="Next" />}
        />
      </form>
    </>
  );
}
