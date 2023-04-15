import React from "react";
import { SectionHeading } from "../../components/SectionHeading";
import { StyledLink } from "../../components/StyledLink";
import { DashboardWidget } from "./DashboardWidget";

export function GettingStartedWidget() {
  return (
    <DashboardWidget title="Getting started">
      <p>There are three steps to get started.</p>
      <ol>
        <li>
          Find a set of terms you want to learn in the{" "}
          <StyledLink to="/vocabulary">find new vocabulary</StyledLink> section.
        </li>
        <li>
          Add those terms to your lessons by clicking "Start studying this
          collection."
        </li>
        <li>
          Return to the Dashboard and click "15 minute lesson with new terms"
          below.
        </li>
      </ol>
    </DashboardWidget>
  );
}
