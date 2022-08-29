import { cherokeeToKey } from "../cards";

export function applyMigration(
  term: string,
  migration: Record<string, string>
) {
  if (term.startsWith("wě:sasgo")) console.log(cherokeeToKey(term));
  return migration[cherokeeToKey(term)] ?? term;
}
