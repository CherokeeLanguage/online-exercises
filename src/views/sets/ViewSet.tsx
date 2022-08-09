import React, { ReactElement } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { StyledAnchor, StyledLink } from "../../components/StyledLink";
import { TermCardList } from "../../components/TermCardList";
import { cards, keyForCard } from "../../data/clean-cll-data";
import { collections, Set, sets } from "../../data/sets";
import { useLeitnerBoxContext } from "../../spaced-repetition/LeitnerBoxProvider";
import { useLessons } from "../../spaced-repetition/LessonsProvider";
import { getToday } from "../../utils/dateUtils";
import { useCardsForTerms } from "../../utils/useCardsForTerms";

export function ViewSet(): ReactElement {
  const { setId } = useParams();
  if (!setId) return <Navigate to="sets/" replace />;
  const set = sets[setId];
  return <_ViewSet set={set} />;
}

function _ViewSet({ set }: { set: Set }): ReactElement {
  // used for starting a new set
  const { upsertLesson } = useLessons();
  const { addNewTerms } = useLeitnerBoxContext();

  const navigate = useNavigate();
  const setCards = useCardsForTerms(cards, set.terms, keyForCard);
  const collectionName =
    (set.collection && collections[set.collection].title) ?? "";

  function createLessonAndReview() {
    const lessonId = "set:" + set.id;
    const terms = Object.values(set.terms);
    upsertLesson({
      id: lessonId,
      createdFor: getToday(),
      completedAt: null,
      terms,
    });
    addNewTerms(terms);
    navigate(`/practice/${lessonId}`);
  }
  return (
    <div>
      <h2>
        {collectionName && `${collectionName} - `}
        {set.title}
      </h2>
      <StyledAnchor as={"button"} onClick={createLessonAndReview}>
        Learn now!
      </StyledAnchor>
      <TermCardList cards={Object.values(setCards)} />
    </div>
  );
}
