import React, { ReactElement } from "react";
import { useParams } from "react-router-dom";
import {
  CollectionDetails,
  MakeUpstreamCollectionButton,
  StyledCollectionHeader,
  UpstreamCollectionFlare,
} from "../../components/CollectionDetails";
import { StyledLink } from "../../components/StyledLink";
import { StyledTable } from "../../components/StyledTable";
import { VisuallyHidden } from "../../components/VisuallyHidden";
import { collections } from "../../data/vocabSets";
import { useUserStateContext } from "../../state/UserStateProvider";
import { CollectionCredits } from "../../components/CollectionCredits";

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
  const { sets, upstreamCollection } = useUserStateContext();
  return (
    <div>
      <StyledCollectionHeader>
        <h2>{collection.title}</h2>

        {upstreamCollection === collection.id ? (
          <UpstreamCollectionFlare />
        ) : (
          <MakeUpstreamCollectionButton collection={collection} />
        )}
      </StyledCollectionHeader>

      <CollectionCredits collection={collection} />

      <h3>Sets in this collection</h3>
      <StyledTable>
        <thead>
          <tr>
            <th>Name</th>
            <th>Number of terms</th>
            <th>Started learning</th>
            <th>
              <VisuallyHidden>Link to view set</VisuallyHidden>
            </th>
          </tr>
        </thead>
        <tbody>
          {collection.sets.map((set, i) => {
            return (
              <tr key={i}>
                <td>{set.title}</td>
                <td>{set.terms.length}</td>

                <td>
                  {set.id in sets
                    ? new Date(sets[set.id].addedAt).toDateString()
                    : "-"}
                </td>

                <td>
                  <StyledLink to={`/vocabulary/set/${set.id}`}>
                    View details
                  </StyledLink>
                </td>
              </tr>
            );
          })}
        </tbody>
      </StyledTable>
    </div>
  );
}
