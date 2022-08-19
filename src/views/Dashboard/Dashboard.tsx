import React, { ReactElement } from "react";
import { LessonsWidget } from "./LessonsWidget";
// import { SetsWidget } from "./SetsWidget";
import { ActivityWidget } from "./ActivityWidget";
import { GettingStartedWidget } from "./GettingStartedWidget";

export function Dashboard(): ReactElement {
  return (
    <div>
      <GettingStartedWidget />
      <ActivityWidget />
      <LessonsWidget />
      {/* <SetsWidget /> */}
    </div>
  );
}
