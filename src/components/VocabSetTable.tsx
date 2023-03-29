import React, { ReactElement } from "react";
import { collections, VocabSet } from "../data/vocabSets";
import { ViewSetPath } from "../routing/paths";
import { StyledLink } from "./StyledLink";
import { StyledTable } from "./StyledTable";
import { VisuallyHidden } from "./VisuallyHidden";

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
          <th>
            <VisuallyHidden>Link to set</VisuallyHidden>
          </th>
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
        <StyledLink to={ViewSetPath(set.id)}>View</StyledLink>
      </td>
    </tr>
  );
}
