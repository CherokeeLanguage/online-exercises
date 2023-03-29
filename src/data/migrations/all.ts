import { cherokeeToKey } from "../cards";

// null marks that term should be _deleted_
export const migrations: Record<string, string | null>[] = [];

export function addMigration(migration: Record<string, string | null>) {
  migrations.push(
    Object.fromEntries(
      Object.entries(migration).map(([k, v]) => [cherokeeToKey(k), v])
    )
  );
}
