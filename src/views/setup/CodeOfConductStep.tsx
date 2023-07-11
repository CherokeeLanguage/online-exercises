import { ReactElement, useContext } from "react";
// import { NavigationButtons, Step, StepProps } from "./SetupPage";
import { Button } from "../../components/Button";
import { Step, wizardContext } from "./SetupWizard";

export const CodeOfConductStep: Step = {
  /*
   * Defines the preamble step. Welcomes users to the site.
   */
  name: "Code of Conduct",
  // title: "Welcome to Cherokee Language Exercises!",
  Component: CodeOfConduct,
};

export function CodeOfConduct(): ReactElement {
  const { finishCodeOfConduct } = useContext(wizardContext);
  return (
    <div>
      This website is dedicated to helping users develop knowledge of the
      Cherokee language.
      <h3>Code of Conduct:</h3>
      <ul>
        <li>Filler text</li>
      </ul>
      <a href="https://github.com/CherokeeLanguage/online-exercises/wiki/Frequently-Asked-Questions">
        FAQ
      </a>
      <Button onClick={finishCodeOfConduct}></Button>
      {/* <NavigationButtons
        goToNextStep={goToNextStep}
        goToPreviousStep={goToPreviousStep}
      /> */}
    </div>
  );
}
