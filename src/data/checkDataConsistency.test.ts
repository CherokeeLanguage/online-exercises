import assert from "assert";
import { statSync } from "fs";
import { cleanCollection, collections } from "./vocabSets";
import { cards, cherokeeToKey, keyForCard } from "./cards";
import { migrateTerm } from "./migrations";
import { migrations } from "./migrations/all";

test("migration references real terms", () => {
  migrations.map((migration) => {
    const unknownTerms = Object.values(migration).filter(
      (newTerm) =>
        // either term is dropped
        newTerm === null ||
        // or references a real card we have now
        cards.find((card) => keyForCard(card) === cherokeeToKey(newTerm)) ===
          undefined
    );
    assert.deepStrictEqual(unknownTerms, []);
  });
});

test("after migration, all terms have cards", () => {
  // terms in the cached set
  // mapped through the migration if it affects them
  // should all now exist
  const missingTermsAfterMigration = Object.values(collections).flatMap(
    (collection) =>
      collection.sets.flatMap((s) =>
        s.terms
          .map((t) => migrateTerm(t))
          .filter(
            (key) => cards.find((c) => keyForCard(c) === key) === undefined
          )
      )
  );
  assert.deepStrictEqual(missingTermsAfterMigration, []);
});

test("all audio exists", () => {
  const missingFiles: string[] = cards.flatMap((card) =>
    card.cherokee_audio.filter(
      (file) =>
        !(
          statSync(`public${file}`, {
            throwIfNoEntry: false,
          })?.isFile() ?? false
        )
    )
  );
  assert.deepStrictEqual(missingFiles, []);
});

test("all terms in collections have cards", () => {
  const termsWithNoCards = Object.values(collections).flatMap((collection) =>
    cleanCollection(collection).sets.flatMap((set) =>
      set.terms.filter(
        (t) => cards.find((card) => keyForCard(card) === t) === undefined
      )
    )
  );

  assert.deepStrictEqual(termsWithNoCards, []);
});
