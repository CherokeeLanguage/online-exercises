import styled from "styled-components";
import { Collection } from "../data/vocabSets";
import { useUserStateContext } from "../state/UserStateProvider";
import { CollectionCredits } from "./CollectionCredits";
import { Button } from "./Button";
import { StyledLink } from "./StyledLink";

export const StyledCollectionHeader = styled.div`
  display: flex;
  align-items: center;
  margin: 16px 0;
  h3,
  h2 {
    margin: 0;
    margin-right: 8px;
    padding: 0;
    flex: 1;
  }
`;

export function UpstreamCollectionFlare() {
  return <span>(new terms are pulled from this collection)</span>;
}

export function MakeUpstreamCollectionButton({
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

const StyledCollectionDetails = styled.div`
  margin-bottom: 60px;
`;

export function CollectionDetails({
  collection,
}: {
  collection: Collection;
  showAddedSets?: boolean;
}) {
  const { upstreamCollection } = useUserStateContext();
  return (
    <StyledCollectionDetails>
      <StyledCollectionHeader>
        <h3>
          <StyledLink to={`/vocabulary/collection/${collection.id}`}>
            {collection.title}
          </StyledLink>
        </h3>

        {upstreamCollection === collection.id ? (
          <UpstreamCollectionFlare />
        ) : (
          <MakeUpstreamCollectionButton collectionId={collection.id} />
        )}
      </StyledCollectionHeader>

      <CollectionCredits collection={collection} />
    </StyledCollectionDetails>
  );
}
