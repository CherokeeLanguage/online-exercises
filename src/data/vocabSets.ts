import { cherokeeToKey } from "./cards";
import CLL1 from "./collections/cll1.json";
import SSW from "./collections/ssw.json";

function cleanSet(set: VocabSet, collectionId: string): VocabSet {
  return {
    ...set,
    collection: collectionId,
    terms: set.terms.map(cherokeeToKey),
  };
}

export function cleanCollection({ id, title, sets }: Collection): Collection {
  return {
    id,
    title,
    sets: sets.map((set) => cleanSet(set, id)),
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

export interface Collection {
  id: string;
  title: string;
  sets: VocabSet[];
}

export interface VocabSet {
  id: string;
  title: string;
  collection?: string;
  terms: string[];
}

export const CHEROKEE_LANGUAGE_LESSONS_COLLLECTION = CLL1.id;
export const SEE_SAY_WRITE_COLLECTION = SSW.id;

// additional sets can be added here
export const collections: Record<string, Collection> = {
  [CHEROKEE_LANGUAGE_LESSONS_COLLLECTION]: cleanCollection(CLL1),
  [SEE_SAY_WRITE_COLLECTION]: cleanCollection(SSW),
};

export const vocabSets: Record<string, VocabSet> = Object.fromEntries(
  Object.values(collections).flatMap((c) => c.sets.map((set) => [set.id, set]))
);
