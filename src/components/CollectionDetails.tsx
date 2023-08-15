import styled from "styled-components";
import { Collection, collections } from "../data/vocabSets";
import { useUserStateContext } from "../providers/UserStateProvider";
import { Button } from "./Button";
import { useState } from "react";
import { ConfirmationModal } from "./ConfirmationModal";
import { ViewCollectionPath } from "../routing/paths";
import { devices, theme } from "../theme";
import { Link } from "react-router-dom";

export const StyledCollectionHeader = styled.div``;

export function UpstreamCollectionFlare() {
  return <em>(new terms come from this collection)</em>;
}

const StyledCollectionDetails = styled.div`
  padding: 10px;
  margin: 10px;
  border-radius: 20px;
  border: 1px solid black;
  background-color: ${theme.hanehldaColors.DARK_BLUE};
  color: white;
`;

const ViewDetailsLink = styled.a`
  display: block;
  background-color: ${theme.colors.WHITE};
  text-decoration: none;
  border: none;
  border-radius: ${theme.borderRadii.md};
  max-width: 300px;
  box-sizing: border-box;
  color: ${theme.hanehldaColors.DARK_GRAY};
  margin: 0 auto;
  align-content: center;
  font-weight: bold;
  padding: 10px;
  font-size: ${theme.fontSizes.lg};
`;

export function CollectionDetails({
  collection,
}: {
  collection: Collection;
  showAddedSets?: boolean;
}) {
  const {
    config: { upstreamCollection },
  } = useUserStateContext();
  return (
    <StyledCollectionDetails>
      <StyledCollectionHeader>
        <ViewDetailsLink as={Link} to={ViewCollectionPath(collection.id)}>
          {collection.title}
        </ViewDetailsLink>
        {upstreamCollection === collection.id && <UpstreamCollectionFlare />}
      </StyledCollectionHeader>
      <p>{collection.credits.description}</p>
    </StyledCollectionDetails>
  );
}
