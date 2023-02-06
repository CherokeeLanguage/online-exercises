import {
  Dispatch,
  ReactElement,
  ReactNode,
  SetStateAction,
  useState,
} from "react";
import {
  UserInteractors,
  useUserStateContext,
} from "../../state/UserStateProvider";
import { Button } from "../Button";
import { Modal } from "../Modal";
import { FakeStep } from "./FakeStep";
import { PhoneticsStep } from "./PhoneticsStep";
import { GroupRegistrationStep } from "./GroupRegistrationStep";
import { PhoneticsPreference } from "../../state/reducers/phoneticsPreference";

export interface WizardState {
  groupId: string;
  phoneticsPreference: PhoneticsPreference;
}

export interface StepProps {
  // these props let us keep track of the user's data
  // partial means any field can be undefined
  wizardState: Partial<WizardState>;
  setWizardState: Dispatch<SetStateAction<Partial<WizardState>>>;

  // these functions let us navigate through the steps
  // undefiend if on first step
  goToPreviousStep?: () => void;
  goToNextStep: () => void;
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
 * You will need to add more steps here.
 */
const steps: Step[] = [GroupRegistrationStep, PhoneticsStep, FakeStep];

export function GettingStartedModal() {
  const userStateContext = useUserStateContext();

  // keep track of which step of workflow we are on (start on first step)
  const [stepNumber, setStepNumber] = useState(0);
  // keep track of what data the user has filled out
  const [wizardState, setWizardState] = useState<Partial<WizardState>>({});

  /**
   * Take all the data the user input and run actions for each step using it
   */
  function finish() {
    // any part of wizard state could be undefined, so unpack it all
    const { groupId, phoneticsPreference } = wizardState;
    // add checks here to make sure fields are defined
    if (groupId !== undefined && phoneticsPreference !== undefined) {
      // reassemble state here (without Partial<>)
      const fullState: WizardState = { groupId, phoneticsPreference };
      // dispatch the actions for each step
      steps.forEach((step) => step.commitState(fullState, userStateContext));
    }
  }

  // render current step of workflow
  const currentStep = steps[stepNumber];
  return (
    <Modal title={currentStep.title} close={() => {}}>
      {/* Rendering a component from a variable! This is how we change the content from step to step */}
      <currentStep.Component
        goToPreviousStep={
          stepNumber === 0
            ? undefined
            : () => {
                setStepNumber(stepNumber - 1);
              }
        }
        goToNextStep={() => {
          const nextStep = stepNumber + 1;
          if (nextStep < steps.length) {
            setStepNumber(nextStep);
          } else {
            finish();
          }
        }}
        setWizardState={setWizardState}
        wizardState={wizardState}
      />
    </Modal>
  );
}

export function NavigationButtons({
  goToPreviousStep,
  goToNextStep,
  customNext,
}: Pick<StepProps, "goToPreviousStep" | "goToNextStep"> & {
  customNext?: ReactNode;
}) {
  return (
    <div>
      {goToPreviousStep && (
        <Button onClick={() => goToPreviousStep()}>Back</Button>
      )}
      {customNext || <Button onClick={() => goToNextStep()}>Next</Button>}
    </div>
  );
}
