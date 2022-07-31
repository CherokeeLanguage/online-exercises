import jsonDeck from "./cll1-v3-with-audio-file.json";

type JsonCard = typeof jsonDeck["cards"][number];

export interface Card {
  cherokee: string;
  english: string;
  cherokee_audio: string[];
  english_audio: string[];
}

export const cards = jsonDeck.cards
  .filter((card) => card.data.challenge_files.length)
  .map(cleanCard);

function cleanCard(card: JsonCard): Card {
  return {
    cherokee: card.data.challenge,
    english: card.data.answer.replace(/^“([^“”]*)”\.$/, "$1"),
    cherokee_audio: card.data.challenge_files.map(({ file }) =>
      file.replace("cache/chr", "/source-chr")
    ),
    english_audio: card.data.answer_files.map(({ file }) =>
      file.replace("cache/en", "/source-en")
    ),
  };
}

console.log("Available cards", cards.length);
