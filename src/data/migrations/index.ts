import { cherokeeToKey } from "../cards";

export function applyMigration(
  term: string,
  migration: Record<string, string>
): string {
  const key = cherokeeToKey(term);
  if (!(key in migration)) return term;
  else return cherokeeToKey(migration[cherokeeToKey(term)]);
}
