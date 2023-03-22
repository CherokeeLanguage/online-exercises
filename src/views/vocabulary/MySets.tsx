import React, { ReactElement } from "react";
import { SectionHeading } from "../../components/SectionHeading";
import { StyledLink } from "../../components/StyledLink";
import { VocabSetTable } from "../../components/VocabSetTable";
import { vocabSets } from "../../data/vocabSets";
import { useAnalyticsPageName } from "../../firebase/hooks";
import { useUserStateContext } from "../../state/UserStateProvider";

export function MySets(): ReactElement {
  useAnalyticsPageName("My sets");
  const {
    config: { sets },
  } = useUserStateContext();
  const userSets = Object.values(sets)
    .sort((a, b) => a.addedAt - b.addedAt)
    .map((metadata) => vocabSets[metadata.setId]);
  return (
    <div>
      <SectionHeading>Your sets</SectionHeading>
      <p>Here you can see the vocab sets you are working on learning.</p>
      {userSets.length > 0 ? (
        <VocabSetTable
          sets={userSets}
          includeCollectionName
          lastColumnName={"Added at"}
          LastCell={({ set }) => (
            <span>{new Date(sets[set.id].addedAt).toDateString()}</span>
          )}
        />
      ) : (
        <p>
          You haven't started learning any vocab sets yet. Browse available sets
          and <StyledLink to="/vocabulary">find new vocabulary</StyledLink> to
          get started.
        </p>
      )}
    </div>
  );
}
