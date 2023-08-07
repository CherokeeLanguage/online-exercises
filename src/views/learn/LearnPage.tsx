import { ReactElement } from "react";
import { HanehldaView } from "../../components/HanehldaView";
import { StudyVocabWidget } from "./StudyVocabWidget";
import { ContentWrapper } from "./styled";
import { PracticeToneWidget } from "./PracticeToneWidget";
import { DefaultNav } from "../../components/HanehldaView/HanehldaNav";
import { StyledAnchor } from "../../components/StyledLink";

export function LearnPage(): ReactElement {
  return (
    <HanehldaView navControls={<DefaultNav />} collapseNav>
      <ContentWrapper>
        <StudyVocabWidget />
        <PracticeToneWidget />

        <p>
          If you have any questions about the site, please read over our{" "}
          <StyledAnchor
            href="https://github.com/CherokeeLanguage/online-exercises/wiki/Frequently-Asked-Questions"
            target="_blank"
          >
            Frequently Asked Questions
          </StyledAnchor>
          .
        </p>
      </ContentWrapper>
    </HanehldaView>
  );
}
