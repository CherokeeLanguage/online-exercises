import { ReactElement } from "react";
import styled from "styled-components";
import {
  Collection,
  CollectionCredits as CollectionCreditsType,
} from "../data/vocabSets";
import { theme } from "../theme";
import React from "react";

const StyledList = styled.ul`
  margin: 0;
  li {
    margin: 0;
    p {
      margin: 0;
    }
  }
`;

const StyledCreditsSection = styled.div`
  margin-bottom: 10px;
  h4 {
    margin: 10px auto;
    text-align: center;
    font-size: ${theme.fontSizes.md};
  }
  text-align: left;
`;

export function CollectionCredits({
  collection: { credits },
}: {
  collection: Collection;
}): ReactElement {
  return (
    <div>
      {credits.externalResources.length > 0 && (
        <StyledCreditsSection>
          <h4>External resources</h4>
          {credits.externalResources.map((resource, i) => (
            <ResourceInfo key={i} resource={resource} />
          ))}
        </StyledCreditsSection>
      )}
      <StyledCreditsSection>
        <h4>Credits</h4>
        <StyledList>
          {credits.credits.map(({ role, name }) => (
            <li>
              <strong>{role}</strong>: {name}
            </li>
          ))}
        </StyledList>
      </StyledCreditsSection>
    </div>
  );
}

const StyledResourceInfo = styled.div`
  a {
    color: white;
    font-weight: bold;
  }
  p {
    margin-top: 0;
  }
  margin-bottom: 16px;
`;

function ResourceInfo({
  resource,
}: {
  resource: CollectionCreditsType["externalResources"][number];
}) {
  return (
    <StyledResourceInfo>
      <a target="_blank" href={resource.href}>
        {resource.name}
      </a>
      {resource.notes && <p>{resource.notes}</p>}
    </StyledResourceInfo>
  );
}
