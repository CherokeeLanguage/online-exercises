import React, { ReactElement } from "react";
import { LessonsWidget } from "./LessonsWidget";
// import { SetsWidget } from "./SetsWidget";
import { GettingStartedWidget } from "./GettingStartedWidget";
import { useUserStateContext } from "../../providers/UserStateProvider";
import { OPEN_BETA_ID } from "../../state/reducers/groupId";
import { MinigameWidget } from "./MinigameWidget";
import { useAnalyticsPageName } from "../../firebase/hooks";
import { GetHelpWidget } from "./GetHelpWidget";

export function Dashboard(): ReactElement {
  const {
    config: { groupId },
  } = useUserStateContext();
  useAnalyticsPageName("Dashboard");
  return (
    <div>
      {/** Only show getting started for folks in open beta */}
      {groupId === OPEN_BETA_ID && <GettingStartedWidget />}
      <MinigameWidget />
      <LessonsWidget />
      <GetHelpWidget />
    </div>
  );
}
