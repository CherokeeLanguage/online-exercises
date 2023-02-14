import { ReactElement } from "react";
import styled from "styled-components";
import { Collection } from "../data/vocabSets";

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
    margin: 0;
  }
`;

export function CollectionCredits({
  collection: { credits },
}: {
  collection: Collection;
}): ReactElement {
  return (
    <div>
      <p>{credits.description}</p>
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
      {credits.externalResources.length > 0 && (
        <StyledCreditsSection>
          <h4>External resources</h4>
          <StyledList>
            {credits.externalResources.map((resource, i) => (
              <li key={i}>
                {resource.notes ? (
                  <p>
                    <a target="_blank" href={resource.href}>
                      {resource.name}
                    </a>
                    : {resource.notes}
                  </p>
                ) : (
                  <a target="_blank" href={resource.href}>
                    {resource.name}
                  </a>
                )}
              </li>
            ))}
          </StyledList>
        </StyledCreditsSection>
      )}
    </div>
  );
}
