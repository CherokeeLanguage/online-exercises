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

export function wordsInTerm(card: Card): string[][] {
  return [card.syllabary.split(" "), card.cherokee.split(" ")];
}

export function wordPairs(card: Card){
  const words = wordsInTerm(card); 
  return words[0].map((syll, idx) => [syll, words[1][idx]]); 
}

function arrayEqual(a: string[], b: string[]) {
  if (a.length !== b.length) { return false; }
  for (var i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) {
          return false;
      }
  }
  return true;
}

function contains(array: string[][], item: string[]) {
  for (var i = 0; i < array.length; ++i) {
      if (arrayEqual(array[i], item)) {
          return true;
      }
  }
  return false;
}

function normalize(array: string[][]) {
  var result = [];
  for (var i = 0; i < array.length; ++i) {
      if (!contains(result, array[i])) {
          result.push(array[i]);
      }
  }
  return result;
}


export function wordsInLesson(lessonCards: Record<string, Card>): string[][]{
  const nestedWordPairs = Object.values(lessonCards).map((card, idx) => wordPairs(card)); 
  const flattened = nestedWordPairs.flat(); 
  //const s = new Set(flattened); 
  
  return normalize(flattened); 

}

export function getSimilarWords(
  correctWord: string[],
  possibleWords: string[][],
  numOptions: number
): string[][] {
  const similarTerms = possibleWords
    .sort(
      (a, b) =>
        trigramSimilarity(b[1], correctWord[1]) -
        trigramSimilarity(a[1], correctWord[1])
    )
    .slice(1, 1 + Math.ceil((numOptions - 1) * 1.5));
  const temptingTerms = pickNRandom(similarTerms, numOptions - 1);

  return temptingTerms;
}
