import cllCards from "./collections/cll1-cards.json";
import sswCards from "./collections/ssw-cards.json";

export interface Card {
  cherokee: string;
  syllabary: string;
  alternate_pronunciations: string[];
  alternate_syllabary: string[];
  english: string;
  cherokee_audio: string[];
  english_audio: string[];
}

export function prefixAudio(path: string) {
  return `${process.env.PUBLIC_URL}/${path}`;
}

function mergeSets(...sets: Card[][]): Card[] {
  return sets.reduce((merged, newSet) => {
    return newSet.reduce((set, card) => {
      const matchIdx = set.findIndex((c) => keyForCard(c) === keyForCard(card));
      if (matchIdx !== -1) {
        const match = set[matchIdx];
        console.log(
          "must merge cards; taking rightmost by default (BAD)",
          card,
          match
        );
        return [...set.slice(0, matchIdx), card, ...set.slice(matchIdx + 1)];
      } else {
        return [...set, card];
      }
    }, merged);
  });
}

function prefixAudioForCards(card: Card): Card {
  return {
    ...card,
    cherokee_audio: card.cherokee_audio.map(prefixAudio),
    english_audio: card.english_audio.map(prefixAudio),
  };
}

export const cards: Card[] = mergeSets(
  cllCards.map(prefixAudioForCards),
  sswCards.map(prefixAudioForCards)
);

export function cherokeeToKey(cherokee: string) {
  return cherokee
    .trim()
    .toLowerCase()
    .replaceAll(/[\.\?\,]/g, "");
}

export function keyForCard(card: Card): string {
  return cherokeeToKey(card.cherokee);
}

console.log("Available cards", cards.length);
