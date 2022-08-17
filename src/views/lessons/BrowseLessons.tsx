import React, { ReactElement } from "react";
import { StyledLink } from "../../components/StyledLink";
import { nameForLesson } from "../../state/reducers/lessons";
import { useUserStateContext } from "../../state/UserStateProvider";

export function BrowseLessons(): ReactElement {
  return (
    <div>
      <h2>Lessons</h2>
      <p>Not implemented</p>
    </div>
  );
}
