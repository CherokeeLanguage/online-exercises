import { useMemo } from "react";

export class MissingCardsError extends Error {
  missingCards: string[];
  constructor(missingCards: string[]) {
    super(`Failed to deserialize ${missingCards.length} cards`);
    this.missingCards = missingCards;
  }
}

/**
 * Given a list of lookups and a list of terms, try to lookup all the terms
 * specified by the key functions, and merge them onto the lookups using `map`.
 *
 * Returns a list of merged lookups and terms and a list of lookup keys that couldn't be matched
 */
function lookupTermsAndCollectMissing<T, L, U>(
  lookups: L[],
  terms: T[],
  lookupKeyFn: (lookup: L) => string,
  termKeyFn: (term: T) => string,
  map: (lookup: L, term: T) => U
): [Record<string, U>, string[]] {
  return lookups.reduce<[Record<string, U>, string[]]>(
    ([found, missing], lookup) => {
      const key = lookupKeyFn(lookup);
      const match = terms.find((term) => termKeyFn(term) === key);
      if (match) {
        return [{ ...found, [key]: map(lookup, match) }, missing];
      } else {
        return [found, [...missing, key]];
      }
    },
    [{}, []]
  );
}

export function useCardsForTerms<T>(
  allCards: T[],
  terms: string[],
  keyFn: (card: T) => string
) {
  const [matched, missing] = useMemo(
    () =>
      lookupTermsAndCollectMissing(
        terms,
        allCards,
        (s) => s.normalize("NFD"), // used for keys
        keyFn,
        (term, card) => card
      ),
    [allCards, terms, keyFn]
  );
  if (missing.length) {
    console.log({ missing });
    throw new MissingCardsError(missing);
  }
  return matched;
}
