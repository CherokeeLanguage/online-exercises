import { ReactElement, useContext } from "react";
// import { NavigationButtons, Step, StepProps } from "./SetupPage";
import { Step, wizardContext } from "./SetupWizard";
import { Hr, NavigationButtons, NextButton } from "./common";
import styled from "styled-components";

export const CodeOfConductStep: Step = {
  /*
   * Defines the preamble step. Welcomes users to the site.
   */
  name: "Code of Conduct",
  // title: "Welcome to Cherokee Language Exercises!",
  Component: CodeOfConduct,
};

const StyledList = styled.ul`
  text-align: left;
`;

export function CodeOfConduct(): ReactElement {
  const { finishCodeOfConduct } = useContext(wizardContext);
  return (
    <div>
      <p>
        <strong>
          This website is dedicated to helping users develop knowledge of the
          Cherokee language.
        </strong>
      </p>
      <Hr />

      <h3>Code of Conduct</h3>
      <StyledList>
        <li>Report issues with content when you find them.</li>
        <li>Share problems using the site with administators.</li>
      </StyledList>
      <Hr />
      <a href="https://github.com/CherokeeLanguage/online-exercises/wiki/Frequently-Asked-Questions">
        FAQ
      </a>
      <NavigationButtons
        right={<NextButton onClick={finishCodeOfConduct}>Accept</NextButton>}
      />
    </div>
  );
}
