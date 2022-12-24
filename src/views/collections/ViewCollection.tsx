import React, { ReactElement } from "react";
import { useParams } from "react-router-dom";
import { CollectionDetails } from "../../components/CollectionDetails";
import { collections } from "../../data/vocabSets";

export function ViewCollection(): ReactElement {
  const { collectionId } = useParams();
  if (collectionId === undefined) throw new Error("Must have collection id");
  return <ViewCollectionPage collectionId={collectionId} />;
}

export function ViewCollectionPage({
  collectionId,
}: {
  collectionId: string;
}): ReactElement {
  const collection = collections[collectionId];
  return (
    <CollectionDetails collection={collection} showAddedSets showCredits />
  );
}
