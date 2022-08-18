import React, { ReactElement } from "react";
import styled from "styled-components";
import { Button } from "../../components/Button";
import { SectionHeading } from "../../components/SectionHeading";
import { StyledLink } from "../../components/StyledLink";
import { collections, VocabSet } from "../../data/vocabSets";
import { useUserStateContext } from "../../state/UserStateProvider";

const StyledSetList = styled.ul`
  padding: 0;
  margin: auto;
  max-width: 800px;
  list-style: none;
`;

const StyledSetLinks = styled.div`
  gap: 8px;
`;

const StyledCollectionHeader = styled.div`
  display: flex;
  align-items: baseline;
  h3 {
    flex: 1;
    margin: 0;
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

          <StyledSetList>
            {collection.sets
              .filter((set) => !(set.id in sets))
              .map((set, i) => {
                return <VocabSetPreview key={i} set={set} />;
              })}
          </StyledSetList>
        </div>
      ))}
    </div>
  );
}

function UpstreamCollectionFlare() {
  return <span>Current upstream collection</span>;
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
      Make upstream collection
    </Button>
  );
}

const StyledLessonHeader = styled.div`
  padding: 8px 32px;
  margin-top: 32px;
  border-bottom: 1px solid #444;
  display: flex;
  justify-content: space-between;
  h2 {
    padding: 0;
    margin: 0;
    min-width: fit-content;
  }
`;

function VocabSetPreview({ set }: { set: VocabSet }): ReactElement {
  return (
    <li>
      <StyledLessonHeader>
        <SectionHeading>{set.title}</SectionHeading>
        <StyledSetLinks>
          <StyledLink to={`/sets/browse/${set.id}`}>View details</StyledLink>
        </StyledSetLinks>
      </StyledLessonHeader>
    </li>
  );
}
