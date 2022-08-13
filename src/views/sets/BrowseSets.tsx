import React, { ReactElement } from "react";
import styled from "styled-components";
import { StyledLink } from "../../components/StyledLink";
import { collections, VocabSet } from "../../data/vocabSets";
import { useUserStateContext } from "../../state/UserStateProvider";

const StyledSetList = styled.ul`
  padding: 0;
  margin: auto;
  max-width: 800px;
  list-style: none;
`;

const StyledSetLinks = styled.div`
  gap: 8px;
`;

export function BrowseSets(): ReactElement {
  const { sets } = useUserStateContext();
  return (
    <div>
      <p>
        Here you can find new vocab sets. If it seems like a set is missing,
        check the "Your sets" tab to see if you are already practicing.
      </p>
      {Object.values(collections).map((collection) => (
        <div>
          <h2>{collection.title}</h2>

          <StyledSetList>
            {collection.sets
              .filter((set) => !(set.id in sets.sets))
              .map((set, i) => {
                return <VocabSetPreview key={i} set={set} />;
              })}
          </StyledSetList>
        </div>
      ))}
    </div>
  );
}

const StyledLessonHeader = styled.div`
  padding: 8px 32px;
  margin-top: 32px;
  border-bottom: 1px solid #444;
  display: flex;
  justify-content: space-between;
  h2 {
    padding: 0;
    margin: 0;
    min-width: fit-content;
  }
`;

function VocabSetPreview({ set }: { set: VocabSet }): ReactElement {
  return (
    <li>
      <StyledLessonHeader>
        <h2>{set.title}</h2>
        <StyledSetLinks>
          <StyledLink to={`/sets/browse/${set.id}`}>View details</StyledLink>
        </StyledSetLinks>
      </StyledLessonHeader>
    </li>
  );
}
