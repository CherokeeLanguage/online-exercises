import { ChangeEvent, FormEvent, useState } from "react";
import { NavigationButtons, Step, StepProps } from ".";
import { GROUPS } from "../../state/reducers/groupId";
import { Button } from "../Button";

export const GroupRegistrationStep: Step = {
  title: "Personal Information",
  Component: GroupRegistrationForm,
  commitState: ({ groupId, email, whereFound }, { registerGroup, setUserEmail, setWhereFound }) => {
    registerGroup(groupId);
    setWhereFound(whereFound);
    setUserEmail(email);
  },
};

export function GroupRegistrationForm({
  wizardState: { groupId , email, whereFound},
  setWizardState,
  goToNextStep,
  goToPreviousStep,
  exitWizard
}: StepProps) {
  const [enabled, setEnabled] = useState(groupId!=undefined && email !== ''); 
  
  function onRadioChanged(e: ChangeEvent<HTMLInputElement>) {
    const groupId = e.target.value;
    setWizardState((s) => ({ ...s, groupId }));
    setEnabled(email !== ''); 
  }

  function onEmailChanged(e: ChangeEvent<HTMLInputElement>) {
    const email = e.target.value;
    setWizardState((s) => ({ ...s, email }));
    setEnabled(groupId !== undefined && email !== ''); 
  }

  function onWhereFoundChanged(e: ChangeEvent<HTMLInputElement>){
    const whereFound = e.target.value;
    setWizardState((s) => ({ ...s, whereFound }));
    setEnabled(whereFound !== undefined);
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (groupId && email && goToNextStep) goToNextStep();
  }
  return (
    <>
      <p> 
        We're happy to have you here! Who are you, and how did you hear about us?
        <br></br>
        <br></br>
        After you've completed this, you're all set! Continue for advanced settings.
      </p>
      <form onSubmit={onSubmit}>
        <fieldset>
          <legend>Email Address</legend>
          <input
            type = "email"
            name = "email"
            value = {email}
            onChange = {onEmailChanged}
          />
        </fieldset>
        <fieldset>
          <legend>Where did you find us?</legend>
          <input
            type = "whereFound"
            name = "whereFound"
            value = {whereFound}
            onChange = {onWhereFoundChanged}
          />
        </fieldset>
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
          exitWizard={exitWizard}
          disabled = {!enabled} 
        >
        </NavigationButtons>
      </form>
    </>
  );
}
