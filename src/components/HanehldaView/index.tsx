import { ReactNode } from "react";
import { HanehldaHeader } from "../HanehldaHeader";
import { Page, ScrollWrapper, PageContent } from "./Page";

export function HanehldaView({
  children,
  navControls,
  noHeader = false,
}: {
  children: ReactNode;
  navControls?: ReactNode;
  noHeader?: boolean;
}) {
  return (
    <Page>
      {!noHeader && <HanehldaHeader>{navControls}</HanehldaHeader>}
      <ScrollWrapper>
        <PageContent>{children}</PageContent>
      </ScrollWrapper>
    </Page>
  );
}
