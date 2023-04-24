import { TermCardWithStats } from "../../spaced-repetition/types";

// @ts-ignore
import trigramSimilarity from "trigram-similarity";
import { Card } from "../../data/cards";

export function pickRandomElement<T>(options: T[]) {
  return options[Math.floor(Math.random() * options.length)];
}

export function pickNRandom<T>(options: T[], n: number): T[] {
  const randomNumbers = new Array(n)
    .fill(0)
    .map((_, idx) => Math.floor(Math.random() * (options.length - idx)));

  const [picked] = randomNumbers.reduce<[T[], number[]]>(
    ([pickedOptions, pickedIdc], nextRandomNumber) => {
      const nextIdx = pickedIdc.reduce(
        (adjustedIdx, alreadyPickedIdx) =>
          // bump up the index for each element we've removed if we are past it
          // eg. [3] has been picked from [0 1 2 _3_ 4 5] and we have 3 has nextRandom number
          // we bump up to 4, as if 3 weren't there
          adjustedIdx + Number(adjustedIdx >= alreadyPickedIdx),
        nextRandomNumber
      );
      return [
        [...pickedOptions, options[nextIdx]],
        [...pickedIdc, nextIdx].sort(),
      ];
    },
    [[], []]
  );

  return picked;
}

export function spliceInAtRandomIndex<T>(
  list: T[],
  newElement: T
): [number, T[]] {
  const listCopy = list.slice(0);
  const insertionIdx = Math.floor(Math.random() * (list.length + 1));
  listCopy.splice(insertionIdx, 0, newElement);
  return [insertionIdx, listCopy];
}

export function getSimilarTerms(
  correctCard: TermCardWithStats<Card>,
  lessonCards: Record<string, Card>,
  numOptions: number
): Card[] {
  const similarTerms = Object.keys(lessonCards)
    .slice(0)
    .sort(
      (a, b) =>
        trigramSimilarity(b, correctCard.card.cherokee) -
        trigramSimilarity(a, correctCard.card.cherokee)
    )
    .slice(1, 1 + Math.ceil((numOptions - 1) * 1.5));
  const temptingTerms = pickNRandom(similarTerms, numOptions - 1);
  const temptingCards = temptingTerms.map((t) => lessonCards[t]);

  return temptingCards;
}
