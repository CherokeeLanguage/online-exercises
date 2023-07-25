import { ReactElement } from "react";
import { HanehldaView } from "../../components/HanehldaView";
import { StudyVocabWidget } from "./StudyVocabWidget";
import { ContentWrapper } from "./styled";
import { PracticeToneWidget } from "./PracticeToneWidget";
import { DefaultNav } from "../../components/HanehldaView/HanehldaNav";

export function LearnPage(): ReactElement {
  return (
    <HanehldaView navControls={<DefaultNav />} collapseNav>
      <ContentWrapper>
        <StudyVocabWidget />
        <PracticeToneWidget />
      </ContentWrapper>
    </HanehldaView>
  );
}
