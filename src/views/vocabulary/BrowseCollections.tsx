import React, { ReactElement, useMemo } from "react";
import { CollectionDetails } from "../../components/CollectionDetails";
import { SectionHeading } from "../../components/SectionHeading";
import { Collection, collections } from "../../data/vocabSets";
import { useAnalyticsPageName } from "../../firebase/hooks";
import { useUserStateContext } from "../../providers/UserStateProvider";
import { HanehldaView } from "../../components/HanehldaView";
import { DefaultNav } from "../../components/HanehldaView/HanehldaNav";

export function BrowseCollections(): ReactElement {
  useAnalyticsPageName("Find new vocabulary");
  const {
    config: { sets, upstreamCollection: upstreamCollectionId },
  } = useUserStateContext();
  // split collections into three:
  // - collection user is learning now
  // - collections user could start learning
  // - collections user has finished learning
  const { upstreamCollection, availableCollections, completedCollections } =
    useMemo(() => {
      const { availableCollections, completedCollections } = Object.values(
        collections
      )
        .filter((c) => c.id !== upstreamCollectionId)
        .reduce<{
          availableCollections: Collection[];
          completedCollections: Collection[];
        }>(
          ({ availableCollections, completedCollections }, collection) =>
            collection.sets.every((set) => set.id in sets)
              ? {
                  availableCollections,
                  completedCollections: [...completedCollections, collection],
                }
              : {
                  availableCollections: [...availableCollections, collection],
                  completedCollections,
                },
          { availableCollections: [], completedCollections: [] }
        );
      return {
        upstreamCollection: upstreamCollectionId
          ? collections[upstreamCollectionId]
          : undefined,
        availableCollections,
        completedCollections,
      };
    }, [upstreamCollectionId, sets]);
  return (
    <HanehldaView navControls={<DefaultNav />} collapseNav>
      <div>
        <SectionHeading>Find new vocabulary</SectionHeading>
        <p>
          Here you can find new collections of vocabulary. Click the title of a
          collection to see the lessons and terms contained.
        </p>

        {upstreamCollection && (
          <>
            <SectionHeading>Learning now</SectionHeading>
            <CollectionDetails collection={upstreamCollection} />
          </>
        )}
        <SectionHeading>Unlearned collections</SectionHeading>
        {availableCollections.length > 0 ? (
          availableCollections.map((collection, idx) => (
            <CollectionDetails collection={collection} key={idx} />
          ))
        ) : (
          <p>
            There are no new available collections. Great job working through
            all our content!
          </p>
        )}
        {completedCollections.length > 0 && (
          <>
            <SectionHeading>Completed collections</SectionHeading>
            {completedCollections.map((collection, idx) => (
              <CollectionDetails collection={collection} key={idx} />
            ))}
          </>
        )}
      </div>
    </HanehldaView>
  );
}
