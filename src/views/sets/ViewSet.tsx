import React, { ReactElement } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Button } from "../../components/Button";
import { SectionHeading } from "../../components/SectionHeading";
import { TermCardList } from "../../components/TermCardList";
import { cards, keyForCard } from "../../data/clean-cll-data";
import { collections, VocabSet, vocabSets } from "../../data/vocabSets";
import { UserSetData } from "../../state/reducers/userSets";
import { useUserStateContext } from "../../state/UserStateProvider";
import { useCardsForTerms } from "../../utils/useCardsForTerms";

export function ViewSet(): ReactElement {
  const { setId } = useParams();
  if (!setId) return <Navigate to="sets/browse" replace />;
  const set = vocabSets[setId];
  return <_ViewSet set={set} />;
}

function _ViewSet({ set }: { set: VocabSet }): ReactElement {
  const { addSet, sets } = useUserStateContext();

  const userSetData = sets[set.id] as UserSetData | undefined;

  const navigate = useNavigate();
  const setCards = useCardsForTerms(cards, set.terms, keyForCard);
  const collectionName =
    (set.collection && collections[set.collection].title) ?? "";

  function addSetAndRedirect() {
    addSet(set.id);
    navigate(`/`);
  }

  return (
    <div>
      <SectionHeading>
        {collectionName && `${collectionName} - `}
        {set.title}
      </SectionHeading>
      {userSetData ? (
        <p>You are already learning this set</p>
      ) : (
        <Button onClick={addSetAndRedirect}>
          Add set and return to dashboard
        </Button>
      )}
      <TermCardList cards={Object.values(setCards)} />
    </div>
  );
}
