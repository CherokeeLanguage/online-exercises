import jsonDeck from "./cll1-v3-with-audio-file.json";
import jsonTermsByLesson from "./terms_by_lesson.json";

type JsonCard = typeof jsonDeck["cards"][number];

export interface Card {
  cherokee: string;
  syllabary: string;
  alternate_pronunciations: string[];
  alternate_syllabary: string[];
  english: string;
  cherokee_audio: string[];
  english_audio: string[];
}

export const cards = jsonDeck.cards
  .filter((card) => card.data.challenge_files.length)
  .map(cleanCard);

export function cherokeeToKey(cherokee: string) {
  return cherokee
    .trim()
    .toLowerCase()
    .replaceAll(/[\.\?\,]/g, "");
}

export function keyForCard(card: Card): string {
  return cherokeeToKey(card.cherokee);
}

function cleanCard(card: JsonCard): Card {
  return {
    cherokee: cherokeeToKey(card.data.challenge),
    syllabary: card.data.syllabary.split(";")[0].trim().toUpperCase(),
    english: card.data.answer.replace(/^“([^“”]*)”\.$/, "$1"),
    cherokee_audio: card.data.challenge_files.map(
      ({ file }) => `${process.env.PUBLIC_URL}/source/chr/${file}`
    ),
    english_audio: card.data.answer_files.map(
      ({ file }) => `${process.env.PUBLIC_URL}/source/en/${file}`
    ),
    alternate_pronunciations: [
      ...card.data.challenge.split(";").slice(1).map(cherokeeToKey),
    ],
    alternate_syllabary: [
      ...card.data.syllabary.split(";").map((s) => s.trim()),
    ],
  };
}

console.log("Available cards", cards.length);

export const termsByLesson = Object.fromEntries(
  Object.entries(jsonTermsByLesson).map(([lessonName, terms]) => [
    lessonName,
    terms.map((term) => cherokeeToKey(term.split(";")[0])),
  ])
);
