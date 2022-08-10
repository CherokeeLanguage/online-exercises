import React, { ReactElement } from "react";
import styled from "styled-components";
import { StyledLink } from "../../components/StyledLink";
import { useLeitnerBoxContext } from "../../spaced-repetition/LeitnerBoxProvider";
import { LeitnerBoxState } from "../../spaced-repetition/useLeitnerBoxes";
import { getToday } from "../../utils/dateUtils";
import { termNeedsPractice } from "../../spaced-repetition/groupTermsIntoLessons";
import { collections, VocabSet, vocabSets } from "../../data/vocabSets";
import {
  UserSetData,
  useUserSetsContext,
} from "../../spaced-repetition/useUserSets";

export function MySets(): ReactElement {
  const { sets } = useUserSetsContext();
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
