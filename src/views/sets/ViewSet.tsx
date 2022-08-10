import React, { ReactElement } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { StyledAnchor } from "../../components/StyledLink";
import { TermCardList } from "../../components/TermCardList";
import { cards, keyForCard } from "../../data/clean-cll-data";
import { collections, VocabSet, vocabSets } from "../../data/vocabSets";
import {
  UserSetData,
  useUserSetsContext,
} from "../../spaced-repetition/useUserSets";
import { useCardsForTerms } from "../../utils/useCardsForTerms";

export function ViewSet(): ReactElement {
  const { setId } = useParams();
  if (!setId) return <Navigate to="sets/browse" replace />;
  const set = vocabSets[setId];
  return <_ViewSet set={set} />;
}

function _ViewSet({ set }: { set: VocabSet }): ReactElement {
  const { addSet, sets } = useUserSetsContext();

  const userSetData = sets[set.id] as UserSetData | undefined;

  const navigate = useNavigate();
  const setCards = useCardsForTerms(cards, set.terms, keyForCard);
  const collectionName =
    (set.collection && collections[set.collection].title) ?? "";

  function registerTermsAndViewLessons() {
    addSet(set.id);
    navigate(`/sets/browse/${set.id}/lessons`);
  }

  return (
    <div>
      <h2>
        {collectionName && `${collectionName} - `}
        {set.title}
      </h2>
      {userSetData ? (
        <p>You are already learning this set</p>
      ) : (
        <StyledAnchor as={"button"} onClick={registerTermsAndViewLessons}>
          Start learning
        </StyledAnchor>
      )}
      <TermCardList cards={Object.values(setCards)} />
    </div>
  );
}
