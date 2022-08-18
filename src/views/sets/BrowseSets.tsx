import React, { ReactElement } from "react";
import styled from "styled-components";
import { Button } from "../../components/Button";
import { SectionHeading } from "../../components/SectionHeading";
import { StyledLink } from "../../components/StyledLink";
import { StyledTable } from "../../components/StyledTable";
import { VisuallyHidden } from "../../components/VisuallyHidden";
import { collections } from "../../data/vocabSets";
import { useUserStateContext } from "../../state/UserStateProvider";

const StyledCollectionHeader = styled.div`
  display: flex;
  align-items: baseline;
  margin: 16px 0;
  h3 {
    margin: 0;
    margin-right: 8px;
    padding: 0;
  }
`;

export function BrowseSets(): ReactElement {
  const { sets, upstreamCollection } = useUserStateContext();
  return (
    <div>
      <SectionHeading>Find new vocabulary</SectionHeading>
      <p>
        Here you can find new vocab sets. If it seems like a set is missing,
        check the "Your sets" tab to see if you are already practicing.
      </p>
      {Object.values(collections).map((collection) => (
        <div>
          <StyledCollectionHeader>
            <h3>{collection.title}</h3>

            {upstreamCollection === collection.id ? (
              <UpstreamCollectionFlare />
            ) : (
              <MakeUpstreamCollectionButton collectionId={collection.id} />
            )}
          </StyledCollectionHeader>

          <StyledTable>
            <thead>
              <th>Name</th>
              <th>Number of terms</th>
              <th>
                <VisuallyHidden>Link to view set</VisuallyHidden>
              </th>
            </thead>
            <tbody>
              {collection.sets
                .filter((set) => !(set.id in sets))
                .map((set, i) => {
                  return (
                    <tr key={i}>
                      <td>{set.title}</td>
                      <td>{set.terms.length}</td>
                      <td>
                        <StyledLink to={`/sets/browse/${set.id}`}>
                          View details
                        </StyledLink>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </StyledTable>
        </div>
      ))}
    </div>
  );
}

function UpstreamCollectionFlare() {
  return <span>(new terms are pulled from this collection)</span>;
}

function MakeUpstreamCollectionButton({
  collectionId,
}: {
  collectionId: string;
}) {
  const { setUpstreamCollection } = useUserStateContext();
  return (
    <Button
      onClick={() => setUpstreamCollection(collectionId)}
      variant="primary"
    >
      Pull new terms from this collection
    </Button>
  );
}
