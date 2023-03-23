import styled from "styled-components";
import { Collection, collections } from "../data/vocabSets";
import { useUserStateContext } from "../providers/UserStateProvider";
import { CollectionCredits } from "./CollectionCredits";
import { Button } from "./Button";
import { StyledLink } from "./StyledLink";
import { useState } from "react";
import { ConfirmationModal } from "./ConfirmationModal";

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
  return <span>(new terms come from this collection)</span>;
}

export function MakeUpstreamCollectionButton({
  collection,
}: {
  collection: Collection;
}) {
  const {
    setUpstreamCollection,
    config: { upstreamCollection },
  } = useUserStateContext();
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <>
      <Button
        onClick={() => {
          if (upstreamCollection) setModalOpen(true);
          else setUpstreamCollection(collection.id);
        }}
        variant="primary"
      >
        Start studying this collection
      </Button>
      {modalOpen && (
        <ConfirmChangeUpstreamCollectionModal
          close={() => setModalOpen(false)}
          newCollection={collection}
        />
      )}
    </>
  );
}

function ConfirmChangeUpstreamCollectionModal({
  close,
  newCollection,
}: {
  close: () => void;
  newCollection: Collection;
}) {
  const {
    setUpstreamCollection,
    config: { upstreamCollection },
  } = useUserStateContext();
  const currentUpstreamCollection = collections[upstreamCollection!];
  return (
    <ConfirmationModal
      title="Switch collections"
      close={close}
      confirm={() => setUpstreamCollection(newCollection.id)}
      confirmContent={
        <>
          Switch to learning <strong>{newCollection.title}</strong>
        </>
      }
    >
      <p>
        You are currently learning from the{" "}
        <strong>{currentUpstreamCollection.title}</strong> collection.
      </p>
      <p>You can always go back and finish this collection later.</p>
    </ConfirmationModal>
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
  const {
    config: { upstreamCollection },
  } = useUserStateContext();
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
          <MakeUpstreamCollectionButton collection={collection} />
        )}
      </StyledCollectionHeader>

      <CollectionCredits collection={collection} />
    </StyledCollectionDetails>
  );
}
