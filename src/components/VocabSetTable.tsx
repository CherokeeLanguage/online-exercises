import React, { ReactElement } from "react";
import styled from "styled-components";
import { collections, VocabSet } from "../data/vocabSets";
import { theme } from "../theme";
import { StyledLink } from "./StyledLink";
import { VisuallyHidden } from "./VisuallyHidden";

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  th {
    text-align: left;
  }
  td {
    border-bottom: 1px solid ${theme.colors.LIGHT_GRAY};
    text-align: left;
  }
  tr:nth-child(2n + 1) {
    td {
      background: ${theme.colors.LIGHTER_GRAY};
    }
  }
`;

export function VocabSetTable({
  sets,
  includeCollectionName = false,
  lastColumnName,
  LastCell,
}: {
  sets: VocabSet[];
  includeCollectionName?: boolean;
  lastColumnName: string;
  LastCell: (props: { set: VocabSet }) => ReactElement;
}) {
  return (
    <StyledTable>
      <thead>
        <tr>
          <th>Name</th>
          <th>Number of terms</th>
          <th>{lastColumnName}</th>
          <VisuallyHidden as={"th"}>Link to set</VisuallyHidden>
        </tr>
      </thead>
      <tbody>
        {sets.map((set, idx) => (
          <VocabSetRow
            key={idx}
            set={set}
            LastCell={LastCell}
            includeCollectionName={includeCollectionName}
          />
        ))}
      </tbody>
    </StyledTable>
  );
}

function setName(set: VocabSet, includeCollectionName: boolean) {
  if (set.collection === undefined) return set.title;
  if (!includeCollectionName) return set.title;
  const collection = collections[set.collection];
  return `${collection.title} - ${set.title}`;
}

function VocabSetRow({
  set,
  includeCollectionName,
  LastCell,
}: {
  set: VocabSet;
  includeCollectionName: boolean;
  LastCell: (props: { set: VocabSet }) => ReactElement;
}) {
  return (
    <tr>
      <td>{setName(set, includeCollectionName)}</td>
      <td>{set.terms.length}</td>
      <td>
        <LastCell set={set} />
      </td>
      <td>
        <StyledLink to={`/sets/browse/${set.id}`}>View</StyledLink>
      </td>
    </tr>
  );
}
