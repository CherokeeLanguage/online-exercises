import { cherokeeToKey } from "./cards";
import CLL1 from "./collections/cll1.json";
import CLL1Credits from "./collections/cll1-credits.json";
import SSW from "./collections/ssw.json";
import SSWCredits from "./collections/ssw-credits.json";

function cleanSet(
  set: Omit<VocabSet, "collection">,
  collectionId: string
): VocabSet {
  return {
    ...set,
    collection: collectionId,
    terms: set.terms.map(cherokeeToKey),
  };
}

export function cleanCollection({
  id,
  title,
  sets,
}: Omit<DiskCollection, "credits">): Omit<Collection, "credits"> {
  return {
    id,
    title,
    sets: sets.map((set) => cleanSet(set, id)),
  };
}

function addCredits(
  { id, title, sets }: Omit<Collection, "credits">,
  credits: CollectionCredits
) {
  return {
    id,
    title,
    sets: sets.map((set) => cleanSet(set, id)),
    credits,
  };
}

function applyMigrationsToSet(
  set: VocabSet,
  migrations: Record<string, string>
): VocabSet {
  return {
    ...set,
    terms: set.terms.map((t) => (t in migrations ? migrations[t] : t)),
  };
}

export function applyMigrationsToCollection(
  collection: Collection,
  migrations: Record<string, string>
): Collection {
  return {
    ...collection,
    sets: collection.sets.map((set) => applyMigrationsToSet(set, migrations)),
  };
}

interface DiskCollection {
  id: string;
  title: string;
  sets: Omit<VocabSet, "collection">[];
}
export interface Collection {
  id: string;
  title: string;
  sets: VocabSet[];
  credits: CollectionCredits;
}

export interface ExternalResource {
  name: string;
  href: string;
  notes?: string;
}

export interface CollectionCredits {
  author: string;
  description: string;
  externalResources: ExternalResource[];
}

export interface VocabSet {
  id: string;
  title: string;
  collection: string;
  terms: string[];
}

export const CHEROKEE_LANGUAGE_LESSONS_COLLLECTION = CLL1.id;
export const SEE_SAY_WRITE_COLLECTION = SSW.id;

// additional sets can be added here
export const collections: Record<string, Collection> = {
  [SEE_SAY_WRITE_COLLECTION]: addCredits(cleanCollection(SSW), SSWCredits),
  [CHEROKEE_LANGUAGE_LESSONS_COLLLECTION]: addCredits(
    cleanCollection(CLL1),
    CLL1Credits
  ),
};

export const vocabSets: Record<string, VocabSet> = Object.fromEntries(
  Object.values(collections).flatMap((c) => c.sets.map((set) => [set.id, set]))
);
