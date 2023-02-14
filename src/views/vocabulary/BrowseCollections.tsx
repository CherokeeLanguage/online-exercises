import React, { ReactElement } from "react";
import { CollectionDetails } from "../../components/CollectionDetails";
import { SectionHeading } from "../../components/SectionHeading";
import { collections } from "../../data/vocabSets";

export function BrowseCollections(): ReactElement {
  return (
    <div>
      <SectionHeading>Find new vocabulary</SectionHeading>
      <p>
        Here you can find new collections of vocabulary. Click the title of a
        collection to see the lessons and terms contained.
      </p>
      {Object.values(collections).map((collection, idx) => (
        <CollectionDetails collection={collection} key={idx} />
      ))}
    </div>
  );
}
