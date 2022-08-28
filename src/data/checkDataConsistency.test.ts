import assert from "assert";
import { statSync } from "fs";
import { cleanCollection, collections } from "./vocabSets";
import { cards, cherokeeToKey, keyForCard } from "./cards";
import { migration } from "./migrations/2022-08-25";

test("migration references real terms", () => {
  const unknownTerms = Object.values(migration).filter(
    (newTerm) =>
      cards.find((card) => keyForCard(card) === cherokeeToKey(newTerm)) ===
      undefined
  );
  assert.deepStrictEqual(unknownTerms, []);
});

test("all data exists", () => {
  const termsWithNoCards: string[] = [];
  Object.values(collections).forEach((collection) => {
    const cleanNewCollection = cleanCollection(collection);

    cleanNewCollection.sets.forEach((set) =>
      set.terms
        .map((t) => cards.find((card) => keyForCard(card) === t))
        .forEach((card, i) => {
          if (!card) termsWithNoCards.push(set.terms[i]);
          else
            card.cherokee_audio.forEach((file) =>
              assert(statSync(`public${file}`).isFile())
            );
        })
    );
  });

  assert.deepStrictEqual(termsWithNoCards, []);
});
