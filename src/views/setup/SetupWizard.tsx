import { ReactElement, useState } from "react";
import { InfoStep } from "./InfoStep";
import { PhoneticsPreference } from "../../state/reducers/phoneticsPreference";
import { PickCourseStep } from "./PickCourseStep";
import { CodeOfConductStep } from "./CodeOfConductStep";
import { useUserStateContext } from "../../providers/UserStateProvider";
import React from "react";
import { useAuth } from "../../firebase/AuthProvider";
import {
  HeaderLabel,
  Page,
  PageContent,
  ScrollWrapper,
} from "../signin/common";
import { HanehldaHeader } from "../../components/HanehldaHeader";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { HANEHLDA_ID } from "../../state/reducers/groupId";

const STEPS = ["Code of Conduct", "Info", "Pick course"] as const;
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
  data: Partial<AllData>;
};

type CollectingInfoState = {
  step: "Info";
  data: Partial<AllData>;
};

type PickingCourseState = {
  step: "Pick course";
  data: Partial<AllData> & InfoData;
};

type AllData = InfoData & PickCourseData;

// type CompleteWizardState = {
//   step: "Finalize";
//   data: InfoData & PickCourseData;
// };

export type WizardState =
  | InitialState
  | CollectingInfoState
  | PickingCourseState;
// | CompleteWizardState;

/**
 * This is the list of steps for the getting started modal.
 */
const steps: Record<StepName, Step> = {
  "Code of Conduct": CodeOfConductStep,
  //   "Info": GroupRegistrationStep,
  Info: InfoStep,
  "Pick course": PickCourseStep,
};
export interface WizardContext {
  state: WizardState;
  goBack: () => void;
  finishCodeOfConduct: () => void;
  finishInfo: (data: InfoData) => void;
  finishPickCourse: (data: PickCourseData) => void;
}

export const wizardContext = React.createContext({} as WizardContext);

const ContentWrapper = styled.div`
  padding: 0 20px;
  max-width: 500px;
  margin: 0 auto;
`;

export function SetupWizard() {
  const { user } = useAuth();
  const userStateContext = useUserStateContext();
  const navigate = useNavigate();

  const [setupState, setSetupState] = useState<WizardState>({
    step: "Code of Conduct",
    data: {},
  });

  function finishCodeOfConduct() {
    setSetupState((s) =>
      s.step === "Code of Conduct" ? { ...s, step: "Info" } : s
    );
  }

  function finishInfo(data: InfoData) {
    setSetupState((s) =>
      s.step === "Info"
        ? { ...s, step: "Pick course", data: { ...s.data, ...data } }
        : s
    );
  }

  function finishPickCourse(data: PickCourseData) {
    if (setupState.step !== "Pick course") return;
    const allData = { ...setupState.data, ...data };
    setSetupState({ ...setupState, step: "Pick course", data: allData });
    finishSetup(allData);
  }

  /**
   * Take all the data the user input and run actions for each step using it
   */
  function finishSetup({
    phoneticsPreference,
    collectionId,
    whereFound,
  }: PickCourseData & InfoData) {
    userStateContext.setPhoneticsPreference(phoneticsPreference);
    userStateContext.setUpstreamCollection(collectionId);
    userStateContext.registerGroup(HANEHLDA_ID);
    userStateContext.setUserEmail(user.email!);
    userStateContext.setWhereFound(whereFound);
    navigate("/");
  }
  function goBack() {
    setSetupState((s) => {
      if (s.step === "Code of Conduct") return s;
      else if (s.step === "Info") return { ...s, step: "Code of Conduct" };
      else if (s.step === "Pick course") return { ...s, step: "Info" };
      else return s;
    });
  }

  // render current step of workflow
  const currentStep = steps[setupState.step];
  const stepNo = STEPS.indexOf(setupState.step) + 1;
  return (
    <wizardContext.Provider
      value={{
        state: setupState,
        finishCodeOfConduct,
        finishInfo,
        finishPickCourse,
        goBack,
      }}
    >
      <Page>
        <HanehldaHeader>
          <HeaderLabel>
            Step {stepNo} of {STEPS.length}
          </HeaderLabel>
        </HanehldaHeader>
        <ScrollWrapper>
          <PageContent>
            <ContentWrapper>
              <currentStep.Component />
            </ContentWrapper>
          </PageContent>
        </ScrollWrapper>
      </Page>
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
