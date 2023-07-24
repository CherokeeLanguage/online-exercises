import { useMemo } from "react";
import { VocabSet, collections, vocabSets } from "../../data/vocabSets";
import { useUserStateContext } from "../../providers/UserStateProvider";
import { theme } from "../../theme";
import { Widget, WidgetButton, WidgetTitle } from "./styled";
import { UserState } from "../../state/useUserState";
import styled from "styled-components";

function percentTermsSeen(
  termsToCheck: string[],
  terms: UserState["leitnerBoxes"]["terms"]
) {
  return (
    termsToCheck.reduce(
      (acc, elm) =>
        terms[elm] === undefined || terms[elm].lastShownDate === 0
          ? acc
          : acc + 1,
      0
    ) / termsToCheck.length
  );
}

const PercentComplete = styled.em`
  display: block;
  font-style: normal;
  font-weight: bold;
  color: ${theme.hanehldaColors.DARK_YELLOW};
  margin-bottom: 10px;
`;

export function StudyVocabWidget() {
  const {
    config: { upstreamCollection: upstreamCollectionId, sets },
    leitnerBoxes: { terms },
  } = useUserStateContext();

  const upstreamCollection = upstreamCollectionId
    ? collections[upstreamCollectionId]
    : null;

  const mostRecentSetFromUpstream = useMemo(
    () =>
      Object.values(sets)
        .sort((a, b) => b.addedAt - a.addedAt)
        .map((s) => vocabSets[s.setId])
        .find((set) => upstreamCollection?.sets.some((s) => s.id === set.id)),
    [upstreamCollection, sets]
  );

  const percentOfSetSeen = useMemo(
    () =>
      mostRecentSetFromUpstream?.terms &&
      percentTermsSeen(mostRecentSetFromUpstream.terms, terms),
    [mostRecentSetFromUpstream, terms]
  );

  const percentComplete = useMemo(
    () =>
      percentTermsSeen(
        upstreamCollection?.sets.flatMap((s) => s.terms) ?? [],
        terms
      ),
    [terms, upstreamCollection]
  );

  return (
    <Widget maxWidth={400} background={theme.hanehldaColors.DARK_RED}>
      <WidgetTitle>Build vocabulary</WidgetTitle>
      <PercentComplete>
        {Math.floor(percentComplete * 100)}% complete
      </PercentComplete>
      <WidgetButton>
        Continue learning from <strong>{upstreamCollection?.title}</strong>
      </WidgetButton>{" "}
      <p>
        <strong>Now learning...</strong> {mostRecentSetFromUpstream?.title} (
        {Math.floor((percentOfSetSeen ?? 0) * 100)}% seen)
      </p>
    </Widget>
  );
}
