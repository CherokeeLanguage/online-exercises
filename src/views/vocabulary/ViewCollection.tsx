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

export function ViewCollection(): ReactElement {
  const { collectionId } = useParams();
  if (collectionId === undefined) throw new Error("Must have collection id");
  return <ViewCollectionPage collectionId={collectionId} />;
}

const CourseContentsWrapper = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const CourseContents = styled.div`
  display: grid;
  margin: 0 auto;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 10px 5px;
  @media screen and (max-width: 600px) {
    grid-template-columns: 1fr;
  }
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
            <>
              <p>{collection.credits.description}</p>
              <CollectionCredits collection={collection} />
            </>
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
        <CourseContentsWrapper>
          <CourseContents>
            {collection.sets.map((set, i) => {
              return <SetCard key={i} set={set} userSets={sets} />;
            })}
          </CourseContents>
        </CourseContentsWrapper>
      </ContentWrapper>
    </HanehldaView>
  );
}

const StyledSetCard = styled.div`
  box-sizing: border-box;
  width: 100%;
  max-width: 300px;
  border: 1px solid black;
  border-radius: 20px;
  margin: 0 auto;
  padding: 10px;
  background-color: ${theme.hanehldaColors.TEXT_CREAM};
`;

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

const CollectionNameLink = styled.a`
  display: inline-block;
  text-decoration: none;
  background-color: ${theme.colors.WHITE};
  border: none;
  border-radius: ${theme.borderRadii.md};
  padding: 5px;
  font-weight: bold;
  width: 100%;
  max-width: 250px;
  box-sizing: border-box;
  font-size: ${theme.fontSizes.md};
  color: ${theme.hanehldaColors.DARK_BLUE};
  margin: 0 auto 20px;
  border: 1px solid black;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
`;

function SetCard({
  set,
  userSets,
}: {
  set: VocabSet;
  userSets: Record<string, UserSetData>;
}) {
  return (
    <StyledSetCard>
      <CollectionNameLink as={Link} to={ViewSetPath(set.id)}>
        {set.title}
      </CollectionNameLink>
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
    </StyledSetCard>
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
