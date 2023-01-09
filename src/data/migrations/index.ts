import { cherokeeToKey } from "../cards";
// import new migrations here
import "./2022-08-25";
import "./2022-12-16";
import { migrations } from "./all";

function applyMigration(
  term: string,
  migration: Record<string, string>
): string {
  const key = cherokeeToKey(term);
  if (!(key in migration)) return term;
  else return cherokeeToKey(migration[cherokeeToKey(term)]);
}

export const migrateTerm = (term: string) =>
  migrations.reduce((t, migration) => applyMigration(t, migration), term);
