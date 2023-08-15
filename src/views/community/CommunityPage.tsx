import styled from "styled-components";
import { HanehldaView } from "../../components/HanehldaView";
import { DefaultNav } from "../../components/HanehldaView/HanehldaNav";
import { Widget, WidgetButton, WidgetTitle } from "../learn/styled";
import { theme } from "../../theme";

const ContentWrapper = styled.div`
  box-sizing: border-box;
  max-width: 700px;
  margin: 0 auto;
  padding: 20px;
`;

export function CommunityPage() {
  return (
    <HanehldaView navControls={<DefaultNav />} collapseNav>
      <ContentWrapper>
        <p>
          Finding community with other language learners is an incredibly
          important part of learning Cherokee. Below are some study groups that
          welcome new members.
        </p>
        <Widget
          maxWidth="max(250px, 60%)"
          background={theme.hanehldaColors.DARK_BLUE}
          align="left"
        >
          <WidgetTitle>Tsalagi Sgadugi</WidgetTitle>
          <p>
            <strong>Tsalagi Sgadugi</strong> is a community study group that
            meets online and in-person whenever members are in the same place.
            Peers facilitate sessions once a week.
          </p>
          <WidgetButton>
            <strong>Reach out</strong>
          </WidgetButton>
        </Widget>
        <Widget
          maxWidth="max(250px, 60%)"
          background={theme.hanehldaColors.DARK_RED}
          align="right"
        >
          <WidgetTitle>ᏣᎳᎩ ᏗᏍᎪᏗ</WidgetTitle>
          <p>
            <strong>ᏣᎳᎩ ᏗᏍᎪᏗ</strong> (Tsalagi Disgodi) is a Discord server for
            Cherokee language learners. Learners can ask each other questions,
            try to chat in Cherokee, and play language games on video/voice
            calls together.
          </p>
          <WidgetButton>
            <strong>Join now</strong>
          </WidgetButton>
        </Widget>
      </ContentWrapper>
    </HanehldaView>
  );
}
