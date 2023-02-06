import { ReactElement } from "react";
import { NavigationButtons, Step, StepProps } from ".";
import { Button } from "../Button";
import { Preferences } from "../../views/settings/Settings";
   



export const PhoneticsStep: Step = {
    title: "Phonetics",
    commitState: () => {},
    Component: PhoneticsStepComponent,
  };


  function PhoneticsStepComponent({
    wizardState,
    goToNextStep,
    goToPreviousStep,
  }: StepProps): ReactElement {
    return (
      <div>
        <p>Select your phonetics preference!</p>
        
        <Preferences/>
        
        <NavigationButtons
          goToPreviousStep={goToPreviousStep}
          goToNextStep={goToNextStep}
          customNext={<Button onClick={() => goToNextStep()}>Next</Button>}
        />
      </div>
    );
  }
  