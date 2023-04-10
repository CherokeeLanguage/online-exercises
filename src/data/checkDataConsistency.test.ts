import assert from "assert";
import { statSync } from "fs";
import { cleanCollection, collections } from "./vocabSets";
import { cards, cherokeeToKey, keyForCard } from "./cards";
import { migrateTerm } from "./migrations";
import { migrations } from "./migrations/all";

test("no unmatched terms after migrating", () => {
  const termsAffectedByMigrations = migrations.reduce<string[]>(
    (terms, migration) => [...terms, ...Object.keys(migration)],
    []
  );
  const unmatchedTermsAfterMigration = termsAffectedByMigrations.filter(
    (term) => {
      const newTerm = migrateTerm(term);
      return (
        // a term is unmatched
        // if the term is not dropped
        // but but there is no corresponding card
        newTerm !== null &&
        cards.find((card) => keyForCard(card) === cherokeeToKey(newTerm)) ===
          undefined
      );
    }
  );

  assert.deepStrictEqual(
    unmatchedTermsAfterMigration.map((t) => [t, migrateTerm(t)]),
    [],
    "There should be no terms that are unmatched after being migrated."
  );
});

test("after migration, all terms have cards", () => {
  // TODO: this test doesn't seem to make sense -- why are we migrating the
  // terms loaded in the app? shouldn't we only migrate terms that are in the
  // users stored term data?

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
