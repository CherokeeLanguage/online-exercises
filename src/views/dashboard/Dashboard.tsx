import React, { ReactElement } from "react";
import { LessonsWidget } from "./LessonsWidget";
// import { SetsWidget } from "./SetsWidget";
import { ActivityWidget } from "./ActivityWidget";
import { GettingStartedWidget } from "./GettingStartedWidget";
import { useUserStateContext } from "../../state/UserStateProvider";
import { OPEN_BETA_ID } from "../../state/reducers/groupId";

export function Dashboard(): ReactElement {
  const { groupId } = useUserStateContext();
  return (
    <div>
      {/** Only show getting started for folks in open beta */}
      {groupId === OPEN_BETA_ID && <GettingStartedWidget />}
      <ActivityWidget />
      <LessonsWidget />
      {/* <SetsWidget /> */}
    </div>
  );
}
