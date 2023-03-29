import { cherokeeToKey } from "../cards";
// import new migrations here
import "./2022-08-25";
import "./2022-12-16";
import "./2023-03-06-phonetics-fixes";
import { migrations } from "./all";

function applyMigration(
  term: string | null,
  migration: Record<string, string | null>
): string | null {
  // dropped terms stay dropped
  if (!term) return null;

  const key = cherokeeToKey(term);
  if (!(key in migration)) return term;
  else {
    const migrated = migration[key];

    if (migrated) return cherokeeToKey(migrated);
    // if the term was dropped return null
    else return null;
  }
}

export const migrateTerm = (term: string) =>
  migrations.reduce<string | null>(
    (t, migration) => applyMigration(t, migration),
    term
  );
