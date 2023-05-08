import { ReactElement } from "react";
import { NavigationButtons, Step, StepProps } from ".";
import { Button } from "../Button";

export const FakeStep: Step = {
  title: "Fake final step",
  commitState: () => {},
  Component: FakeStepComponent,
};

function FakeStepComponent({
  wizardState,
  goToNextStep,
  goToPreviousStep,
}: StepProps): ReactElement {
  return (
    <div>
      <p>Debug final step!</p>
      <p>{JSON.stringify(wizardState)}</p> 
      <NavigationButtons
        goToNextStep={goToNextStep}
        goToPreviousStep={goToPreviousStep}
      />
    </div>
  );
}
