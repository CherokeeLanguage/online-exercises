import { ReactElement } from "react";
import { Widget, WidgetButton, WidgetTitle } from "./styled";
import { theme } from "../../theme";

export function PracticeToneWidget(): ReactElement {
  return (
    <Widget maxWidth={300} background={theme.hanehldaColors.DARK_GRAY}>
      <WidgetTitle>Practice your tone</WidgetTitle>
      <WidgetButton>
        <strong>Begin practice session</strong>
      </WidgetButton>
    </Widget>
  );
}
