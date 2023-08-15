import React, { ReactElement, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/Button";
import { CardTable } from "../../components/CardTable";
import { cards, keyForCard } from "../../data/cards";
import { collections, VocabSet, vocabSets } from "../../data/vocabSets";
import { useUserStateContext } from "../../providers/UserStateProvider";
import { useCardsForTerms } from "../../utils/useCardsForTerms";
import { CollectionCredits } from "../../components/CollectionCredits";
import { ConfirmationModal } from "../../components/ConfirmationModal";
import { BuildPracticeLessonModal } from "../../components/BuildPracticeLessonModal";
import { useAnalyticsPageName } from "../../firebase/hooks";
import { StyledCollectionHeader } from "../../components/CollectionDetails";
import { HanehldaView } from "../../components/HanehldaView";
import { DefaultNav } from "../../components/HanehldaView/HanehldaNav";
import {
  ActionsWrapper,
  ContentWrapper,
  ShowMoreButton,
  StyledCourseDescription,
} from "./styled";

export function ViewSet(): ReactElement {
  const { setId } = useParams();
  if (!setId) return <Navigate to="/vocabulary" replace />;
  const set = vocabSets[setId];
  return <_ViewSet set={set} />;
}

function _ViewSet({ set }: { set: VocabSet }): ReactElement {
  const [removeSetModalOpen, setRemoveSetModalOpen] = useState(false);
  const [buildPracticeLessonModalOpen, setBuildPracticeLessonModalOpen] =
    useState(false);

  useAnalyticsPageName(`Set view (${set.id})`);

  const {
    removeSet,
    config: { sets, upstreamCollection },
  } = useUserStateContext();

  const navigate = useNavigate();
  const setCards = useCardsForTerms(cards, set.terms, keyForCard);
  const collection = collections[set.collection];

  function removeSetAndRedirect() {
    removeSet(set.id);
    navigate("/");
  }

  const [showMore, setShowMore] = useState(false);

  return (
    <HanehldaView navControls={<DefaultNav />} collapseNav>
      <ContentWrapper>
        <StyledCourseDescription>
          <StyledCollectionHeader>
            {upstreamCollection === collection.id && (
              <strong>Now learning</strong>
            )}
            <h2>
              <em>{collection.title}</em> / {set.title}
            </h2>
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
          <Button onClick={() => setBuildPracticeLessonModalOpen(true)}>
            Practice just these terms
          </Button>
          {set.id in sets && (
            <Button
              onClick={() => setRemoveSetModalOpen(true)}
              variant="negative"
            >
              Stop learning these terms
            </Button>
          )}
        </ActionsWrapper>

        <h3>
          Terms in set <em>{set.title}</em>
        </h3>
        <CardTable cards={Object.values(setCards)} />

        {buildPracticeLessonModalOpen && (
          <BuildPracticeLessonModal
            set={set}
            close={() => setBuildPracticeLessonModalOpen(false)}
          />
        )}
        {removeSetModalOpen && (
          <ConfirmRemoveSetModal
            set={set}
            close={() => setRemoveSetModalOpen(false)}
            confirm={removeSetAndRedirect}
          />
        )}
      </ContentWrapper>
    </HanehldaView>
  );
}

function ConfirmRemoveSetModal({
  set,
  close,
  confirm,
}: {
  set: VocabSet;
  close: () => void;
  confirm: () => void;
}): ReactElement {
  return (
    <ConfirmationModal
      title={`Remove set ${set.title}`}
      close={close}
      confirm={confirm}
      confirmVariant="negative"
      confirmContent={<>Delete all data on up to {set.terms.length} terms</>}
    >
      <p>
        If you remove this set, all your data on terms from this set will be
        deleted.
      </p>
      <p>
        You may still see terms from this set if they are in another set you are
        learning.
      </p>
    </ConfirmationModal>
  );
}
