import React from "react";
import { StyledAnchor } from "../../components/StyledLink";
import { DashboardWidget } from "./DashboardWidget";

export function GetHelpWidget() {
  return (
    <DashboardWidget title="Get help">
      <p>
        If you have any questions about the site, please read over our{" "}
        <StyledAnchor href="https://github.com/CherokeeLanguage/online-exercises/wiki/Frequently-Asked-Questions">
          Frequently Asked Questions
        </StyledAnchor>
        .
      </p>
    </DashboardWidget>
  );
}
