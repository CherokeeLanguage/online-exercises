import React, { ReactElement } from "react";
import { SectionHeading } from "../../components/SectionHeading";
import { VocabSetTable } from "../../components/VocabSetTable";
import { vocabSets } from "../../data/vocabSets";
import { useUserStateContext } from "../../state/UserStateProvider";

export function MySets(): ReactElement {
  const { sets } = useUserStateContext();
  const userSets = Object.values(sets)
    .sort((a, b) => a.addedAt - b.addedAt)
    .map((metadata) => vocabSets[metadata.setId]);
  return (
    <div>
      <SectionHeading>Your sets</SectionHeading>
      <p>Here you can see the vocab sets you are working on learning.</p>
      <VocabSetTable
        sets={userSets}
        includeCollectionName
        lastColumnName={"Added at"}
        LastCell={({ set }) => (
          <span>{new Date(sets[set.id].addedAt).toDateString()}</span>
        )}
      />
    </div>
  );
}
