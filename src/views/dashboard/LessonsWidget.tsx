import React, { ReactElement } from "react";
import { ButtonLink } from "../../components/Button";
import { StyledLink } from "../../components/StyledLink";
import { Collection, collections } from "../../data/vocabSets";
import { useUserStateContext } from "../../providers/UserStateProvider";
import { NewLessonPath, ViewCollectionPath } from "../../routing/paths";
import { getToday } from "../../utils/dateUtils";
import { DashboardWidget } from "./DashboardWidget";

const CHALLENGES_IN_15_MINUTE_LESSON = 90;

export function LessonsWidget(): ReactElement {
  const {
    leitnerBoxes,
    config: { upstreamCollection: collectionId },
  } = useUserStateContext();

  const upstreamCollection = collectionId
    ? collections[collectionId]
    : undefined;

  const today = getToday();

  const termsToStudyToday = Object.values(leitnerBoxes.terms).filter(
    (t) => t.nextShowDate <= today
  );

  const termsToReviewToday = termsToStudyToday.filter(
    (t) => t.lastShownDate !== 0
  );
  const newTermsForToday = termsToStudyToday.filter(
    (t) => t.lastShownDate === 0
  );

  const termsReviewedToday = Object.values(leitnerBoxes.terms).filter(
    (t) => t.lastShownDate >= today
  );

  return (
    <DashboardWidget title="Learn vocabulary">
      {upstreamCollection === undefined && newTermsForToday.length > 0 && (
        <p>
          You have{" "}
          <strong>
            {newTermsForToday.length} new term
            {newTermsForToday.length !== 1 && "s"}
          </strong>{" "}
          selected to mix into today's lessons.
        </p>
      )}
      {termsToReviewToday.length > 0 ? (
        <p>
          You have{" "}
          <strong>
            {termsToReviewToday.length} term
            {termsToReviewToday.length !== 1 && "s"} to review
          </strong>{" "}
          today.
        </p>
      ) : (
        <p>
          You don't have any terms to review today. Sounds like a great time to
          work on new terms!
        </p>
      )}
      {termsReviewedToday.length > 0 ? (
        <p>
          You have already reviewed{" "}
          <strong>
            {termsReviewedToday.length} term
            {termsReviewedToday.length !== 1 && "s"}
          </strong>{" "}
          today. ᎤᏍᏆᏂᎩᏗ!
        </p>
      ) : (
        <p>
          You haven't reviewed any terms yet today. Click one of the buttons
          below to start learning!
        </p>
      )}
      <div style={{ gap: "16px", display: "flex" }}>
        <ButtonLink to={NewLessonPath(CHALLENGES_IN_15_MINUTE_LESSON, false)}>
          15 minute lesson with new terms
        </ButtonLink>
        <ButtonLink to={NewLessonPath(CHALLENGES_IN_15_MINUTE_LESSON, true)}>
          15 minute review session
        </ButtonLink>
      </div>
    </DashboardWidget>
  );
}

function newTermsText(upstreamCollection: Collection | undefined) {
  if (upstreamCollection)
    return (
      <p>
        Right now, new terms come from the{" "}
        <StyledLink to={ViewCollectionPath(upstreamCollection.id)}>
          {upstreamCollection.title}
        </StyledLink>{" "}
        collection.
      </p>
    );
  else
    return (
      <p>
        Right now, you aren't working through any collections, so you'll have to
        add new terms one set at a time.
      </p>
    );
}
