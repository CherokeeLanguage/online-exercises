import cllCards from "./collections/cll1-cards.json";
import sswCards from "./collections/ssw-cards.json";
import walcCards from "./collections/walc-1-cards.json";
import jwLivingPhrases from "./collections/jw-living-phrases-cards.json";

/**
 * Represents the phonetic system used to write the phonetics for cards.
 *
 * Note: This enum is shared with the Python codebase. Please sync all changes.
 */
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
  /** If tones on a card are not reliable, hide them by setting this */
  forcePlainPhonetics?: boolean;
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

/**
 * Mark all cards as having non-proofread tone that shouldn't be shown to users.
 */
function forcePlainPhonetics(card: Card) {
  return { ...card, forcePlainPhonetics: true };
}

export const searchableCards = mergeSets(
  // not including cll
  sswCards.map(cleanCard),
  walcCards.map(cleanCard).map(forcePlainPhonetics),
  jwLivingPhrases.map(cleanCard)
);

export const cards: Card[] = mergeSets(
  cllCards.map(cleanCard),
  searchableCards
);

export function cherokeeToKey(cherokee: string) {
  return cherokee
    .trim()
    .toLowerCase()
    .replaceAll(/[.?,]/g, "")
    .normalize("NFD");
}

export function keyForCard(card: Card): string {
  return cherokeeToKey(card.cherokee);
}

console.log("Available cards", cards.length);
