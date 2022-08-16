import React, { ReactElement } from "react";
import { LessonsWidget } from "./LessonsWidget";
import { SetsWidget } from "./SetsWidget";
import { UpcomingCardsWidget } from "./UpcomingCardsWidget";

export function Dashboard(): ReactElement {
  return (
    <div>
      <UpcomingCardsWidget />
      <LessonsWidget />
      {/* <SetsWidget /> */}
    </div>
  );
}
