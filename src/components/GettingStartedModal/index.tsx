import {
  Dispatch,
  ReactElement,
  ReactNode,
  SetStateAction,
  useState,
} from "react";
import { Button } from "../Button";
import { Modal } from "../Modal";
import { PhoneticsStep } from "./PhoneticsStep";
import { GroupRegistrationStep } from "./GroupRegistrationStep";
import { PhoneticsPreference } from "../../state/reducers/phoneticsPreference";
import { ChooseSetStep } from "./ChooseSetStep";
import { StepIndicator } from "./StepIndicator";
import { Preamble } from "./Preamble";
import { useUserStateContext } from "../../providers/UserStateProvider";
import { UserInteractors } from "../../state/useUserState";

export interface WizardState {
  // gives us information about the state of the entire wizard
  groupId: string;
  email: string;
  whereFound: string;
  phoneticsPreference?: PhoneticsPreference;
  collectionId?: string; 
}

export interface StepProps {
  // these props let us keep track of the user's data
  // partial means any field can be undefined
  wizardState: Partial<WizardState>;
  setWizardState: Dispatch<SetStateAction<Partial<WizardState>>>;

  // these functions let us navigate through the steps
  // undefiend if on first step
  goToPreviousStep?: () => void;
  goToNextStep?: () => void; 
  exitWizard?: () => void;
}

export interface Step {
  title: string;
  Component: (props: StepProps) => ReactElement;
  /**
   * This function says how we should actually update user state.
   */
  commitState: (state: WizardState, interactors: UserInteractors) => void;
}

/**
 * This is the list of steps for the getting started modal.
 *
 */
const steps: Step[] = [Preamble, GroupRegistrationStep, PhoneticsStep, ChooseSetStep];

export function GettingStartedModal() {
  const userStateContext = useUserStateContext();

  // keep track of which step of workflow we are on (start on first step)
  const [stepNumber, setStepNumber] = useState(0);
  // keep track of what data the user has filled out 
  const [wizardState, setWizardState] = useState<Partial<WizardState>>({ });

  const [fullState, setFullState] = useState<WizardState | null>(null);
  //const [fullState, setFullState] = useState<WizardState>({groupId: '', phoneticsPreference: null, collectionId: '', email: '', whereFound: ''});
  
  function exitWizard(){
    const { groupId, email, whereFound } = wizardState;

    // check if all required fields have been filled out
    if (groupId && email && whereFound) {
      // if all fields are filled out, update user state and exit the modal
      const fullState: WizardState = {
        groupId,
        email,
        whereFound,
      };
      steps.forEach((step) => step.commitState(fullState, userStateContext));
      setFullState(fullState);
      // TODO: perform any necessary cleanup or finalization
    } else {
      // if any required fields are missing, show an error message or prevent the user from exiting
      alert("Please fill out all required fields.");
      // alternatively, you can disable the exit button until all required fields are filled out
    }
  }

  /**
   * Take all the data the user input and run actions for each step using it
   */
  function exitWizardAtEnd() {
    // any part of wizard state could be undefined, so unpack it all
    const { groupId, email, phoneticsPreference, collectionId, whereFound} = wizardState;
    // add checks here to make sure fields are defined
    if (groupId !== undefined && email !== undefined && phoneticsPreference !== undefined && collectionId != undefined && whereFound !== undefined) {
      // reassemble state here (without Partial<>)
      const fullState: WizardState = { groupId, email, phoneticsPreference, collectionId, whereFound};
      // dispatch the actions for each step
      steps.forEach((step) => step.commitState(fullState, userStateContext));
    }
  }

  // render current step of workflow
  const currentStep = steps[stepNumber];
  return (
    <Modal title={currentStep.title} >
      {/* Rendering a component from a variable! This is how we change the content from step to step */}
      <currentStep.Component
        goToPreviousStep={
          stepNumber === 0 ? undefined // if step one, is undefined
            : () => { //otherwise, decrement
                setStepNumber(stepNumber - 1);
              }
        }
        goToNextStep={() => {
          const nextStep = stepNumber + 1;
          if (nextStep < steps.length) {
            setStepNumber(nextStep);
          } else {
            exitWizardAtEnd();
          }
        }}
        exitWizard={() => {
            exitWizard(); 
        }}
        setWizardState={setWizardState}
        wizardState={wizardState}
      />

    <div>
      <StepIndicator> {stepNumber + 1} / {steps.length}  </StepIndicator>
        
    </div>
    </Modal>
  );
}

export function NavigationButtons({
  /*
   * Defines the buttons available to the user for steps of the Getting Started Modal.
   */ 
  goToPreviousStep,
  goToNextStep,
  exitWizard,
  disabled
}: Pick<StepProps, "goToPreviousStep" | "goToNextStep" | "exitWizard"> & {
  disabled?: boolean; 
  children?: React.ReactNode;
}) {
  return (
    <div style={{ position: "relative" }}>
      {goToPreviousStep && (
        <Button onClick={() => goToPreviousStep()}>Back</Button>
      )}
      {goToNextStep && (
        <Button onClick={() => goToNextStep()}
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
          }}
        >
          Next
        </Button>
      )}
      {exitWizard && (
        <Button onClick={() => exitWizard()}
          style={{
            position: "absolute",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          Exit
        </Button>
      )}
    </div>
  );
}
