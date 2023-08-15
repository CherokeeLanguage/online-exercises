import React, { ReactElement } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { Card, cards, keyForCard } from "../../data/cards";
import { nameForLesson } from "../../state/reducers/lessons";
import { ReviewResult } from "../../state/reducers/leitnerBoxes";
import { useCardsForTerms } from "../../utils/useCardsForTerms";
import { LessonProvider, useLesson } from "../../providers/LessonProvider";
import { SectionHeading } from "../../components/SectionHeading";
import { CardTable } from "../../components/CardTable";
import { StyledLink } from "../../components/StyledLink";
import { useAnalyticsPageName } from "../../firebase/hooks";
import { DashboardPath, LessonsPath } from "../../routing/paths";
import { BlueEm } from "../settings/SettingsPage";
import { HanehldaView } from "../../components/HanehldaView";
import { DefaultNav } from "../../components/HanehldaView/HanehldaNav";
import styled from "styled-components";
import { LearnPage } from "../learn/LearnPage";
import { Button } from "../../components/Button";
import { theme } from "../../theme";
import { Hr } from "../setup/common";

export function ViewLesson(): ReactElement {
  useAnalyticsPageName("View lesson");
  const { lessonId } = useParams();
  const navigate = useNavigate();
  if (!lessonId) return <Navigate to={LessonsPath} replace />;
  return (
    <LessonProvider
      lessonId={lessonId}
      onLessonDoesNotExist={() => navigate("/lessons", { replace: true })}
    >
      <_ViewLesson />
    </LessonProvider>
  );
}

const reviewResultNames: Record<ReviewResult, string> = {
  ALL_CORRECT: "All correct",
  SINGLE_MISTAKE: "Only one mistake",
  REPEAT_MISTAKE: "Multiple mistakes",
};

const ContentWrapper = styled.div`
  padding: 5px 20px;
`;

const ReviewedCardsWrapper = styled.div`
  h3 {
    text-align: left;
    margin: 10px;
    font-size: ${theme.fontSizes.md};
  }
`;

export function _ViewLesson(): ReactElement {
  const { lesson, reviewedTerms } = useLesson();
  const reviewedCards = useCardsForTerms(
    cards,
    Object.keys(reviewedTerms),
    keyForCard
  );

  const reviewedCardsByStatus: Record<ReviewResult, Card[]> = Object.entries(
    reviewedTerms
  ).reduce<Record<ReviewResult, Card[]>>(
    (grouped, [term, reviewResult]) => ({
      ...grouped,
      [reviewResult]: [...grouped[reviewResult], reviewedCards[term]],
    }),
    {
      [ReviewResult.ALL_CORRECT]: [],
      [ReviewResult.SINGLE_MISTAKE]: [],
      [ReviewResult.REPEAT_MISTAKE]: [],
    }
  );
  return (
    <HanehldaView navControls={<DefaultNav />} collapseNav>
      <div>
        <ContentWrapper>
          <h2>Lesson debrief</h2>
          <BlueEm as="h3" style={{ margin: "0" }}>
            {nameForLesson(lesson)}
          </BlueEm>
          <p>
            Take a look at how you did! If you were confused by a term, go ahead
            and listen to all the alternate pronouncations by hitting the "More"
            button.
          </p>
          <Button as={Link} to={DashboardPath}>
            Keep learning
          </Button>
        </ContentWrapper>
        <hr />
        <ReviewedCardsWrapper>
          {Object.entries(reviewedCardsByStatus).map(
            ([result, cards]) =>
              cards.length > 0 && (
                <div>
                  <h3>{reviewResultNames[result as ReviewResult]}</h3>
                  <CardTable cards={cards} />
                </div>
              )
          )}
        </ReviewedCardsWrapper>
        <ContentWrapper>
          <Button as={Link} to={DashboardPath}>
            Keep learning
          </Button>
        </ContentWrapper>
      </div>
    </HanehldaView>
  );
}
