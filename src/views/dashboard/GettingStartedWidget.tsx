import React from "react";
import { SectionHeading } from "../../components/SectionHeading";
import { StyledLink } from "../../components/StyledLink";

export function GettingStartedWidget() {
  return (
    <div>
      <SectionHeading>Getting started</SectionHeading>
      <p>There are four main steps to get started.</p>
      <ol>
        <li>
          Find a set of terms you want to learn in the{" "}
          <StyledLink to="/sets/browse">find new vocabulary</StyledLink>{" "}
          section.
        </li>
        <li>
          Add those terms to your lessons by clicking "Add set and return to
          dashboard."
        </li>
        <li>Click "15 minute lesson with new terms" below.</li>
        <li>Pick an exercise and start practicing terms!</li>
      </ol>
      <p>
        If you want to work through a collection of sets automatically, without
        having to add each set as it's time to introduce more terms, you can
        click "Pull new terms from this collection" in the{" "}
        <StyledLink to="/sets/browse">find new vocabulary</StyledLink> section.
      </p>
    </div>
  );
}
