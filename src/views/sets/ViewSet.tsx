import React, { ReactElement } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { StyledAnchor } from "../../components/StyledLink";
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
  const { addSet, sets, refreshDailyLessons } = useUserStateContext();

  const userSetData = sets[set.id] as UserSetData | undefined;

  const navigate = useNavigate();
  const setCards = useCardsForTerms(cards, set.terms, keyForCard);
  const collectionName =
    (set.collection && collections[set.collection].title) ?? "";

  function registerTermsAndRecreateLessons() {
    addSet(set.id);
    refreshDailyLessons();
    navigate(`/lessons/`);
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
        <StyledAnchor as={"button"} onClick={registerTermsAndRecreateLessons}>
          Add set to today's lessons
        </StyledAnchor>
      )}
      <TermCardList cards={Object.values(setCards)} />
    </div>
  );
}
