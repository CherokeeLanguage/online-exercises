import React, { ReactElement } from "react";
import { StyledLink } from "../../components/StyledLink";
import { vocabSets } from "../../data/vocabSets";
import { UserSetData } from "../../state/reducers/userSets";
import { useUserStateContext } from "../../state/UserStateProvider";

export function MySets(): ReactElement {
  const { sets } = useUserStateContext();
  return (
    <div>
      <p>Here you can see the vocab sets you are working on learning.</p>
      {Object.values(sets).map((metadata) => (
        <VocabSetPreview metadata={metadata} />
      ))}
    </div>
  );
}

function VocabSetPreview({
  metadata,
}: {
  metadata: UserSetData;
}): ReactElement {
  const set = vocabSets[metadata.setId];
  return (
    <div>
      <h3>
        {set.title} - {set.terms.length} terms
      </h3>
      <p>Started learning on {new Date(metadata.addedAt).toDateString()}</p>
      <StyledLink to={`/sets/browse/${set.id}`}>View set details</StyledLink>
    </div>
  );
}
