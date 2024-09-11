import React, { ReactElement, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { StyledCollectionHeader } from "../../components/CollectionDetails";
import { Collection, VocabSet, collections } from "../../data/vocabSets";
import { useUserStateContext } from "../../providers/UserStateProvider";
import { CollectionCredits } from "../../components/CollectionCredits";
import { useAnalyticsPageName } from "../../firebase/hooks";
import { ViewSetPath } from "../../routing/paths";
import { DefaultNav } from "../../components/HanehldaView/HanehldaNav";
import { HanehldaView } from "../../components/HanehldaView";
import styled from "styled-components";
import { UserSetData } from "../../state/reducers/userSets";
import { theme } from "../../theme";
import {
  ContentWrapper,
  StyledCourseDescription,
  ShowMoreButton,
  ActionsWrapper,
} from "./styled";
import { Button } from "../../components/Button";
import { ConfirmationModal } from "../../components/ConfirmationModal";
import { CardGrid, GridCard } from "../../components/CardGrid";

export function ViewCollection(): ReactElement {
  const { collectionId } = useParams();
  if (collectionId === undefined) throw new Error("Must have collection id");
  return <ViewCollectionPage collectionId={collectionId} />;
}

const ExtraCollectionDetails = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

export function ViewCollectionPage({
  collectionId,
}: {
  collectionId: string;
}): ReactElement {
  const collection = collections[collectionId];

  useAnalyticsPageName(`View collection (${collection.title})`);

  const {
    config: { sets, upstreamCollection },
    setUpstreamCollection,
  } = useUserStateContext();

  const [showMore, setShowMore] = useState(false);

  return (
    <HanehldaView navControls={<DefaultNav />} collapseNav>
      <ContentWrapper>
        <StyledCourseDescription>
          <StyledCollectionHeader>
            {upstreamCollection === collection.id && (
              <strong>Now learning</strong>
            )}
            <h2>{collection.title}</h2>
          </StyledCollectionHeader>
          {showMore && (
            <ExtraCollectionDetails>
              <p>{collection.credits.description}</p>
              <CollectionCredits collection={collection} />
            </ExtraCollectionDetails>
          )}
          <ShowMoreButton onClick={() => setShowMore(!showMore)}>
            {showMore ? "Show less" : "Show more"}
          </ShowMoreButton>
        </StyledCourseDescription>
        <ActionsWrapper>
          {upstreamCollection !== collection.id && (
            <MakeUpstreamCollectionButton collection={collection} />
          )}
        </ActionsWrapper>
        <h3>Sets in this collection</h3>
        <CardGrid>
          {collection.sets.map((set, i) => {
            return <SetCard key={i} set={set} userSets={sets} />;
          })}
        </CardGrid>
      </ContentWrapper>
    </HanehldaView>
  );
}

const StatRow = styled.div`
  display: flex;
  max-width: 250px;
  margin: 0 auto 10px;
  & :first-child {
    text-align: left;
    flex: 1;
  }
  & :last-child {
    text-align: right;
  }
  em {
    font-style: normal;
    color: ${theme.hanehldaColors.DARK_GRAY};
  }
`;

function SetCard({
  set,
  userSets,
}: {
  set: VocabSet;
  userSets: Record<string, UserSetData>;
}) {
  return (
    <GridCard
      color={theme.hanehldaColors.LIGHT_YELLOW}
      title={set.title}
      link={ViewSetPath(set.id)}
    >
      <StatRow>
        <em>Number of terms</em>
        <strong>{set.terms.length}</strong>
      </StatRow>

      {set.id in userSets ? (
        <StatRow>
          <em>Started learning</em>
          <strong>{new Date(userSets[set.id].addedAt).toDateString()}</strong>
        </StatRow>
      ) : (
        <div>
          <em>
            <strong>Not started yet</strong>
          </em>
        </div>
      )}
    </GridCard>
  );
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
      <p>
        You may still see new content from{" "}
        <strong>{currentUpstreamCollection.title}</strong> as you finish the
        chapter or unit you have in progress.
      </p>
    </ConfirmationModal>
  );
}
