import { SectionHeading } from "../../components/SectionHeading";
import { useUserStateContext } from "../../state/UserStateProvider";
import { getToday } from "../../utils/dateUtils";

export function ActivityWidget() {
  const { leitnerBoxes, upstreamCollection } = useUserStateContext();
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
    <div>
      <SectionHeading>Activity</SectionHeading>

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
    </div>
  );
}
