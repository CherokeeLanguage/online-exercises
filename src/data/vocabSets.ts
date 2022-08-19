import { termsByLesson } from "./clean-cll-data";

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

export const CHEROKEE_LANGUAGE_LESSONS_COLLLECTION = "CLL1";

// additional sets can be added here
export const collections: Record<string, Collection> = {
  [CHEROKEE_LANGUAGE_LESSONS_COLLLECTION]: {
    id: CHEROKEE_LANGUAGE_LESSONS_COLLLECTION,
    title: "Cherokee Language Lessons 1",
    sets: Object.entries(termsByLesson).map(([chapters, terms]) => ({
      id: `${CHEROKEE_LANGUAGE_LESSONS_COLLLECTION}:${chapters}`, // bad - fixme
      title: chapters,
      collection: CHEROKEE_LANGUAGE_LESSONS_COLLLECTION,
      terms: terms,
    })),
  },
};

export const vocabSets: Record<string, VocabSet> = Object.fromEntries(
  Object.values(collections).flatMap((c) => c.sets.map((set) => [set.id, set]))
);
