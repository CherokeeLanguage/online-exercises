import { ReactElement, useState } from "react";
import { InfoStep } from "./InfoStep";
import { PhoneticsPreference } from "../../state/reducers/phoneticsPreference";
import { PickCourseStep } from "./PickCourseStep";
import { CodeOfConductStep } from "./CodeOfConductStep";
import { useUserStateContext } from "../../providers/UserStateProvider";
import React from "react";
import { useAuth } from "../../firebase/AuthProvider";

const STEPS = ["Code of Conduct", "Info", "Pick course", "Finalize"] as const;
export type StepName = (typeof STEPS)[number];

export interface Step {
  name: StepName;
  Component: () => ReactElement;
}

export interface InfoData {
  whereFound: string;
  phoneticsPreference: PhoneticsPreference;
}

export interface PickCourseData {
  collectionId: string;
}

type InitialState = {
  step: "Code of Conduct";
};

type CollectingInfoState = {
  step: "Info";
};

type PickingCourseState = {
  step: "Pick course";
  data: InfoData;
};

type CompleteWizardState = {
  step: "Finalize";
  data: InfoData & PickCourseData;
};

export type WizardState =
  | InitialState
  | CollectingInfoState
  | PickingCourseState
  | CompleteWizardState;

/**
 * This is the list of steps for the getting started modal.
 */
const steps: Record<StepName, Step> = {
  "Code of Conduct": CodeOfConductStep,
  //   "Info": GroupRegistrationStep,
  Info: InfoStep,
  "Pick course": PickCourseStep,
  Finalize: {
    name: "Finalize",
    Component(): ReactElement {
      return <p>"Hi"</p>;
    },
  },
};
export interface WizardContext {
  finishCodeOfConduct: () => void;
  finishInfo: (data: InfoData) => void;
  finishPickCourse: (data: PickCourseData) => void;
  finishSetup: () => void;
}

export const wizardContext = React.createContext({} as WizardContext);

export function SetupWizard() {
  const { user } = useAuth();
  const userStateContext = useUserStateContext();

  const [setupState, setSetupState] = useState<WizardState>({
    step: "Code of Conduct",
  });

  function finishCodeOfConduct() {
    setSetupState((s) => (s.step === "Code of Conduct" ? { step: "Info" } : s));
  }

  function finishInfo(data: InfoData) {
    setSetupState((s) =>
      s.step === "Info" ? { step: "Pick course", data } : s
    );
  }

  function finishPickCourse(data: PickCourseData) {
    setSetupState((s) =>
      s.step === "Pick course"
        ? { step: "Finalize", data: { ...s.data, ...data } }
        : s
    );
  }

  /**
   * Take all the data the user input and run actions for each step using it
   */
  function finishSetup() {
    if (setupState.step !== "Finalize") return;

    const { phoneticsPreference, collectionId, whereFound } = setupState.data;

    userStateContext.setPhoneticsPreference(phoneticsPreference);
    userStateContext.setUpstreamCollection(collectionId);
    userStateContext.setUserEmail(user.email!);
    userStateContext.setWhereFound(whereFound);
  }

  // render current step of workflow
  const currentStep = steps[setupState.step];
  return (
    <wizardContext.Provider
      value={{ finishCodeOfConduct, finishInfo, finishPickCourse, finishSetup }}
    >
      <currentStep.Component />
    </wizardContext.Provider>
    // {/* Rendering a component from a variable! This is how we change the content from step to step */}
    // <currentStep.Component
    //   goToPreviousStep={
    //     stepNumber === 0
    //       ? undefined // if step one, is undefined
    //       : () => {
    //           //otherwise, decrement
    //           setStepNumber(stepNumber - 1);
    //         }
    //   }
    //   goToNextStep={() => {
    //     const nextStep = stepNumber + 1;
    //     if (nextStep < steps.length) {
    //       setStepNumber(nextStep);
    //     } else {
    //       exitWizardAtEnd();
    //     }
    //   }}
    //   exitWizard={() => {
    //     exitWizardNoAdvanced();
    //   }}
    //   setWizardState={setWizardState}
    //   wizardState={wizardState}
    // />

    //   <div>
    //     <StepIndicator>
    //       {" "}
    //       {stepNumber + 1} / {steps.length}{" "}
    //     </StepIndicator>
    //   </div>
    // </Modal>
  );
}

// export function NavigationButtons({
//   /*
//    * Defines the buttons available to the user for steps of the Getting Started Modal.
//    */
//   goToPreviousStep,
//   goToNextStep,
//   exitWizard,
//   disabled,
// }: Pick<StepProps, "goToPreviousStep" | "goToNextStep" | "exitWizard"> & {
//   disabled?: boolean;
//   children?: React.ReactNode;
// }) {
//   return (
//     <div style={{ position: "relative" }}>
//       {goToPreviousStep && (
//         <Button onClick={() => goToPreviousStep()}>Back</Button>
//       )}
//       {goToNextStep && (
//         <Button
//           onClick={() => goToNextStep()}
//           style={{
//             position: "absolute",
//             bottom: 0,
//             right: 0,
//           }}
//         >
//           Next
//         </Button>
//       )}
//       {exitWizard && (
//         <Button
//           onClick={() => exitWizard()}
//           style={{
//             position: "absolute",
//             bottom: 0,
//             left: "50%",
//             transform: "translateX(-50%)",
//           }}
//         >
//           Exit
//         </Button>
//       )}
//     </div>
//   );
// }
