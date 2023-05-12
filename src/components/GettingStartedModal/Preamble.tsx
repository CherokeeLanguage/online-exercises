import { ReactElement } from "react";
import { NavigationButtons, Step, StepProps } from ".";
import { Button } from "../Button";

export const Preamble: Step = {
  /*
   * Defines the preamble step. Welcomes users to the site. 
   */
  title: "Welcome to Cheroke Language Exercises!",
  commitState: () => {},
  Component: FirstStepComponent,
};

function FirstStepComponent({
  /*
   * The first component of the wizard. Advances to the next step or redirects to FAQ page.
   */
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
        - Filler text 1.
        <br></br>
        - Filler text 2.
        <br></br>
        - Filler text 3.
      <br></br>
      <br></br>

      <a href = "https://github.com/CherokeeLanguage/online-exercises/wiki/Frequently-Asked-Questions">FAQ</a>

      <NavigationButtons
        goToNextStep={goToNextStep}
        goToPreviousStep={goToPreviousStep}
      />
    </div>
  );
}
