import React, { ReactElement } from "react";
import { CollectionDetails } from "../../components/CollectionDetails";
import { SectionHeading } from "../../components/SectionHeading";
import { collections } from "../../data/vocabSets";

export function BrowseSets(): ReactElement {
  return (
    <div>
      <SectionHeading>Find new vocabulary</SectionHeading>
      <p>
        Here you can find new vocab sets. If it seems like a set is missing,
        check the "Your sets" tab to see if you are already practicing.
      </p>
      {Object.values(collections).map((collection) => (
        <CollectionDetails collection={collection} />
      ))}
    </div>
  );
}
