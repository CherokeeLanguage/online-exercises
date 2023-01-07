import cllCards from "./collections/cll1-cards.json";
import sswCards from "./collections/ssw-cards.json";

export enum PhoneticOrthography {
  MCO = "MCO",
  WEBSTER = "WEBSTER",
}

const DEFAULT_ORTHOGRAPHY = PhoneticOrthography.MCO;

function phoneticOrthographyOrThrow(
  orthography: string | undefined
): PhoneticOrthography {
  if (orthography === undefined) return DEFAULT_ORTHOGRAPHY;
  if (orthography in PhoneticOrthography)
    return orthography as PhoneticOrthography;
  else
    throw new Error(
      `Invalid string for phonetic orthography (got: ${JSON.stringify(
        orthography
      )})`
    );
}

interface DiskCard {
  cherokee: string;
  syllabary: string;
  alternate_pronunciations: string[];
  alternate_syllabary: string[];
  english: string;
  cherokee_audio: string[];
  english_audio: string[];
  phoneticOrthography?: string;
}

export interface Card {
  cherokee: string;
  syllabary: string;
  alternate_pronunciations: string[];
  alternate_syllabary: string[];
  english: string;
  cherokee_audio: string[];
  english_audio: string[];
  phoneticOrthography: PhoneticOrthography;
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

function cleanCard({ phoneticOrthography, ...card }: DiskCard): Card {
  return prefixAudioForCards({
    ...card,
    phoneticOrthography: phoneticOrthographyOrThrow(phoneticOrthography),
  });
}

export const cards: Card[] = mergeSets(
  cllCards.map(cleanCard),
  sswCards.map(cleanCard)
);

export function cherokeeToKey(cherokee: string) {
  return cherokee.trim().toLowerCase().replaceAll(/[.?,]/g, "");
}

export function keyForCard(card: Card): string {
  return cherokeeToKey(card.cherokee);
}

console.log("Available cards", cards.length);
