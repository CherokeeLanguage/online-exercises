import { ReactElement } from "react";
import { NavigationButtons, Step, StepProps } from ".";
import { Button } from "../Button";

export const Preamble: Step = {
  title: "Welcome to Cheroke Language Exercises!",
  commitState: () => {},
  Component: FakeStepComponent,
};

function FakeStepComponent({
  wizardState,
  goToNextStep,
  goToPreviousStep,
  exitWizard
}: StepProps): ReactElement {
  return (
    <div>
      This website is dedicated to helping users develop knowledge of the Cherokee language.
      <br></br>
      <br></br>
      Code of Conduct:
      <br></br>
        - Absolutely no being a poopyhead.
        <br></br>
        - Zero poopyhead behavior allowed.
        <br></br>
        - No poopyheads!
      <br></br>

      <a href = "https://github.com/CherokeeLanguage/online-exercises/wiki/Frequently-Asked-Questions">FAQ</a>

      <NavigationButtons
        goToNextStep={goToNextStep}
        goToPreviousStep={goToPreviousStep}
      />
    </div>
  );
}
