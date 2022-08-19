import styled from "styled-components";
import { Collection } from "../data/vocabSets";
import { useUserStateContext } from "../state/UserStateProvider";
import { Button } from "./Button";
import { StyledLink } from "./StyledLink";
import { StyledTable } from "./StyledTable";
import { VisuallyHidden } from "./VisuallyHidden";

const StyledCollectionHeader = styled.div`
  display: flex;
  align-items: center;
  margin: 16px 0;
  h3 {
    margin: 0;
    margin-right: 8px;
    padding: 0;
    flex: 1;
  }
`;

function UpstreamCollectionFlare() {
  return <span>(new terms are pulled from this collection)</span>;
}

function MakeUpstreamCollectionButton({
  collectionId,
}: {
  collectionId: string;
}) {
  const { setUpstreamCollection } = useUserStateContext();
  return (
    <Button
      onClick={() => setUpstreamCollection(collectionId)}
      variant="primary"
    >
      Pull new terms from this collection
    </Button>
  );
}

export function CollectionDetails({
  collection,
  showAddedSets = false,
}: {
  collection: Collection;
  showAddedSets?: boolean;
}) {
  const { upstreamCollection, sets } = useUserStateContext();
  const setsToShow = showAddedSets
    ? collection.sets
    : collection.sets.filter((set) => !(set.id in sets));
  return (
    <div>
      <StyledCollectionHeader>
        <h3>{collection.title}</h3>

        {upstreamCollection === collection.id ? (
          <UpstreamCollectionFlare />
        ) : (
          <MakeUpstreamCollectionButton collectionId={collection.id} />
        )}
      </StyledCollectionHeader>

      <StyledTable>
        <thead>
          <th>Name</th>
          <th>Number of terms</th>
          {showAddedSets && <th>Started learning</th>}
          <th>
            <VisuallyHidden>Link to view set</VisuallyHidden>
          </th>
        </thead>
        <tbody>
          {setsToShow.map((set, i) => {
            return (
              <tr key={i}>
                <td>{set.title}</td>
                <td>{set.terms.length}</td>
                {showAddedSets && (
                  <td>
                    {set.id in sets
                      ? new Date(sets[set.id].addedAt).toDateString()
                      : "-"}
                  </td>
                )}
                <td>
                  <StyledLink to={`/sets/browse/${set.id}`}>
                    View details
                  </StyledLink>
                </td>
              </tr>
            );
          })}
        </tbody>
      </StyledTable>
    </div>
  );
}
