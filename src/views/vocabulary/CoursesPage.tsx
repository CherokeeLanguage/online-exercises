import React, { ReactElement, useMemo } from "react";
import { CollectionDetails } from "../../components/CollectionDetails";
import { SectionHeading } from "../../components/SectionHeading";
import {
  CHEROKEE_LANGUAGE_LESSONS_COLLLECTION,
  Collection,
  collections,
} from "../../data/vocabSets";
import { useAnalyticsPageName } from "../../firebase/hooks";
import { useUserStateContext } from "../../providers/UserStateProvider";
import { HanehldaView } from "../../components/HanehldaView";
import { DefaultNav } from "../../components/HanehldaView/HanehldaNav";
import { Hr } from "../setup/common";
import styled from "styled-components";

const ContentWrapper = styled.div`
  padding: 10px;
  max-width: 800px;
  margin: 0 auto;
`;

export function CoursesPage(): ReactElement {
  useAnalyticsPageName("Find new vocabulary");
  const {
    config: { sets, upstreamCollection: upstreamCollectionId },
  } = useUserStateContext();
  // split collections into three:
  // - collection user is learning now
  // - collections user has started learning but hasn't finished
  // - collections user has not started learning
  // - collections user has finished learning
  const {
    upstreamCollection,
    inProgressCollections,
    unstartedCollections,
    completedCollections,
  } = useMemo(() => {
    const {
      inProgressCollections,
      unstartedCollections,
      completedCollections,
    } = Object.values(collections)
      .filter((c) => c.id !== upstreamCollectionId)
      .reduce<{
        completedCollections: Collection[];
        inProgressCollections: Collection[];
        unstartedCollections: Collection[];
      }>(
        (
          { inProgressCollections, unstartedCollections, completedCollections },
          collection
        ) => {
          if (collection.sets.every((set) => set.id in sets))
            // every set added means completed
            return {
              completedCollections: [...completedCollections, collection],
              inProgressCollections,
              unstartedCollections,
            };
          else if (collection.sets.some((set) => set.id in sets))
            // some but not every means in progress
            return {
              completedCollections,
              inProgressCollections: [...inProgressCollections, collection],
              unstartedCollections,
            };
          // none means unstarted
          else {
            // hide CLL
            if (collection.id === CHEROKEE_LANGUAGE_LESSONS_COLLLECTION) {
              return {
                completedCollections,
                inProgressCollections,
                unstartedCollections,
              };
            }
            return {
              completedCollections,
              inProgressCollections,
              unstartedCollections: [...unstartedCollections, collection],
            };
          }
        },
        {
          completedCollections: [],
          inProgressCollections: [],
          unstartedCollections: [],
        }
      );
    return {
      upstreamCollection: upstreamCollectionId
        ? collections[upstreamCollectionId]
        : undefined,
      completedCollections,
      inProgressCollections,
      unstartedCollections,
    };
  }, [upstreamCollectionId, sets]);
  return (
    <HanehldaView navControls={<DefaultNav />} collapseNav>
      <ContentWrapper>
        <SectionHeading>Find new vocabulary</SectionHeading>
        <p>
          Here you can find new collections of vocabulary. Click the title of a
          collection to see the lessons and terms contained.
        </p>
        <Hr />
        {upstreamCollection && (
          <>
            <SectionHeading>Learning now</SectionHeading>
            <CollectionDetails collection={upstreamCollection} />
          </>
        )}
        {inProgressCollections.length > 0 && (
          <>
            <SectionHeading>Courses you've started</SectionHeading>
            {inProgressCollections.map((collection, idx) => (
              <CollectionDetails collection={collection} key={idx} />
            ))}
          </>
        )}
        <SectionHeading>New courses</SectionHeading>
        {unstartedCollections.length > 0 ? (
          unstartedCollections.map((collection, idx) => (
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
            <SectionHeading>Completed courses</SectionHeading>
            {completedCollections.map((collection, idx) => (
              <CollectionDetails collection={collection} key={idx} />
            ))}
          </>
        )}
      </ContentWrapper>
    </HanehldaView>
  );
}
