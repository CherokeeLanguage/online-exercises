import { ReactNode, useEffect, useState } from "react";
import { HanehldaHeader } from "./HanehldaHeader";
import { Page, ScrollWrapper, PageContent, ContentArea } from "./Page";
import { useMedia } from "react-use";
import { devices } from "../../theme";
import { IconButton } from "../IconButton";
import { BsThreeDots, BsX } from "react-icons/bs";
import { VisuallyHidden } from "../VisuallyHidden";
import { Nav, NavDrawer } from "./HanehldaNav";

export function HanehldaView({
  children,
  navControls,
  noHeader = false,
  collapseNav = true,
}: {
  children: ReactNode;
  navControls?: ReactNode;
  noHeader?: boolean;
  collapseNav?: boolean;
}) {
  const [navOpen, setNavOpen] = useState(false);

  const isWide = useMedia(devices.tablet);
  useEffect(() => setNavOpen(false), [isWide]);

  if (!collapseNav || isWide)
    return (
      <Page>
        {!noHeader && <HanehldaHeader>{navControls}</HanehldaHeader>}
        <ScrollWrapper>
          <PageContent>{children}</PageContent>
        </ScrollWrapper>
      </Page>
    );

  const showHideNav = (
    <Nav
      right={
        <IconButton
          Icon={navOpen ? BsX : BsThreeDots}
          onClick={() => setNavOpen(!navOpen)}
          color={"white"}
        >
          <VisuallyHidden>
            {navOpen ? "Hide navigation" : "Show navigation"}
          </VisuallyHidden>
        </IconButton>
      }
    ></Nav>
  );

  return (
    <Page>
      {!noHeader && <HanehldaHeader>{showHideNav}</HanehldaHeader>}
      <ContentArea>
        <ScrollWrapper>
          <PageContent>{children}</PageContent>
        </ScrollWrapper>
        {navOpen && (
          <NavDrawer closeDrawer={() => setNavOpen(false)}>
            {navControls}
          </NavDrawer>
        )}
      </ContentArea>
    </Page>
  );
}
