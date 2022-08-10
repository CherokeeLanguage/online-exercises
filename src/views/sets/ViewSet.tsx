import React, { ReactElement } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { StyledAnchor } from "../../components/StyledLink";
import { TermCardList } from "../../components/TermCardList";
import { cards, keyForCard } from "../../data/clean-cll-data";
import { collections, Set, sets } from "../../data/sets";
import { useLeitnerBoxContext } from "../../spaced-repetition/LeitnerBoxProvider";
import { useCardsForTerms } from "../../utils/useCardsForTerms";

export function ViewSet(): ReactElement {
  const { setId } = useParams();
  if (!setId) return <Navigate to="sets/" replace />;
  const set = sets[setId];
  return <_ViewSet set={set} />;
}

function _ViewSet({ set }: { set: Set }): ReactElement {
  // used for starting a new set
  const { addNewTerms } = useLeitnerBoxContext();

  const navigate = useNavigate();
  const setCards = useCardsForTerms(cards, set.terms, keyForCard);
  const collectionName =
    (set.collection && collections[set.collection].title) ?? "";

  function registerTermsAndViewLessons() {
    addNewTerms(Object.values(set.terms));
    navigate(`/sets/${set.id}/lessons`);
  }
  return (
    <div>
      <h2>
        {collectionName && `${collectionName} - `}
        {set.title}
      </h2>
      <StyledAnchor as={"button"} onClick={registerTermsAndViewLessons}>
        Learn now!
      </StyledAnchor>
      <TermCardList cards={Object.values(setCards)} />
    </div>
  );
}
