import React, { ReactElement } from "react";
import { ButtonLink } from "../../components/Button";
import { SectionHeading } from "../../components/SectionHeading";
import { StyledLink } from "../../components/StyledLink";
import { Collection, collections } from "../../data/vocabSets";
import { useUserStateContext } from "../../state/UserStateProvider";

export function LessonsWidget(): ReactElement {
  const { upstreamCollection: collectionId } = useUserStateContext();
  const upstreamCollection = collectionId
    ? collections[collectionId]
    : undefined;

  function createLessonPath(numChallenges: number, reviewOnly: boolean) {
    return `/lessons/new/${numChallenges}/${reviewOnly}`;
  }

  return (
    <div>
      <SectionHeading>Learn now</SectionHeading>
      <p>You should try to do at least one lesson with new terms a day.</p>
      {newTermsText(upstreamCollection)}
      <div style={{ gap: "16px", display: "flex" }}>
        <ButtonLink to={createLessonPath(120, false)}>
          15 minute lesson with new terms
        </ButtonLink>
        <ButtonLink to={createLessonPath(120, true)}>
          15 minute review session
        </ButtonLink>
      </div>
    </div>
  );
}

function newTermsText(upstreamCollection: Collection | undefined) {
  if (upstreamCollection)
    return (
      <p>
        Right now, new terms come from the{" "}
        <StyledLink to={`/collections/${upstreamCollection.id}`}>
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
