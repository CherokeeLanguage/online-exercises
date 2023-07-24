import { ReactElement } from "react";
import { HanehldaView } from "../../components/HanehldaView";
import { StudyVocabWidget } from "./StudyVocabWidget";
import { ContentWrapper } from "./styled";
import { PracticeToneWidget } from "./PracticeToneWidget";

export function LearnPage(): ReactElement {
  return (
    <HanehldaView>
      <ContentWrapper>
        <StudyVocabWidget />
        <PracticeToneWidget />
      </ContentWrapper>
    </HanehldaView>
  );
}
