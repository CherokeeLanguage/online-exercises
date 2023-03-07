import React, { ReactElement, useMemo } from "react";
import { Card } from "../../data/cards";
import { TermCardWithStats } from "../../spaced-repetition/types";
import { PhoneticsPreference } from "../../state/reducers/phoneticsPreference";
import { useUserStateContext } from "../../state/UserStateProvider";
import { createIssueForTermInNewTab } from "../../utils/createIssue";
import { getPhonetics } from "../../utils/phonetics";
import { useAudio } from "../../utils/useAudio";
import { ExerciseComponentProps } from "./Exercise";

export function pickRandomElement<T>(options: T[]) {
  return options[Math.floor(Math.random() * options.length)];
}

export function validWordsToHide(phoneticsWords: string[]): [number, string][] {
  return phoneticsWords
    .map<[number, string]>((word, i) => [i, word])
    .filter(([_idx, word]) => (word.match(/[¹²³⁴]/g)?.length ?? 0) >= 2); // only include words with at least two tones to match
}

export function toneSyllables(word: string) {
  return word
    .replaceAll(/([¹²³⁴]+)/g, "$1===")
    .split("===")
    .filter((syllable) => syllable !== "");
}

export function maskTonesOnSyllable(
  syllables: string[],
  hideToneIdx: number
): [string[], string] {
  return [
    syllables.map((syllable, idx) =>
      idx === hideToneIdx ? syllable.replace(/[¹²³⁴]/g, "") : syllable
    ),
    syllables[hideToneIdx].replaceAll(/[^¹²³⁴]/g, ""),
  ];
}

export function WriteTheTones({
  currentCard,
  reviewCurrentCard,
}: ExerciseComponentProps): ReactElement {
  return (
    <div style={{ maxWidth: "800px", margin: "auto" }}>
      <p>
        Here you can practice working with tone by filling in the missing tone
        sequence.
      </p>
      <Flashcard card={currentCard} reviewCurrentCard={reviewCurrentCard} />
    </div>
  );
}

const possibleTones = [""];

export function Flashcard({
  card,
  reviewCurrentCard,
}: {
  card: TermCardWithStats<Card>;
  reviewCurrentCard: (correct: boolean) => void;
}) {
  const { groupId } = useUserStateContext();

  const phonetics = useMemo(
    () => getPhonetics(card.card, PhoneticsPreference.Detailed),
    [card]
  );

  const phoneticsWords = useMemo(() => phonetics.split(" "), [phonetics]);

  const [maskedWordIdx, wordToMask] = useMemo(
    () => pickRandomElement(validWordsToHide(phoneticsWords)),
    [phonetics]
  );

  const [maskedSyllableIdx, hiddenTone, maskedSyllables] = useMemo(() => {
    const syllables = toneSyllables(wordToMask);
    const lastSyllableHasDistinctiveTone =
      syllables[syllables.length - 1].match(/[¹²³⁴]/);
    const syllableToMask = Math.floor(
      Math.random() *
        (lastSyllableHasDistinctiveTone
          ? syllables.length
          : syllables.length - 1)
    );
    const [maskedSyllables, hiddenTone] = maskTonesOnSyllable(
      syllables,
      syllableToMask
    );
    return [syllableToMask, hiddenTone, maskedSyllables];
  }, [wordToMask]);

  // pick random voice to use
  const cherokeeAudio = useMemo(
    () => pickRandomElement(card.card.cherokee_audio),
    [card]
  );

  const { play } = useAudio({
    src: cherokeeAudio,
    autoplay: true,
  });

  return (
    <div style={{ fontSize: 18 }}>
      <p>{card.card.syllabary}</p>
      <p>
        {phoneticsWords.map((word, idx) => (
          <>
            {idx > 0 && " "}
            {idx === maskedWordIdx ? (
              <span>
                {maskedSyllables.map((syllable, syllableIdx) => (
                  <>
                    {syllable}
                    {syllableIdx === maskedSyllableIdx && (
                      <mark>
                        <sup style={{ border: "red" }}>??</sup>
                      </mark>
                    )}
                  </>
                ))}
              </span>
            ) : (
              <span>{word}</span>
            )}
          </>
        ))}
      </p>
      <button onClick={() => play()}>Listen again</button>
      <button onClick={() => createIssueForTermInNewTab(groupId, card.term)}>
        Flag an issue with this term
      </button>
    </div>
  );
}

function FlashcardControls({
  reviewCard,
  playAudio,
}: {
  reviewCard: (correct: boolean) => void;
  playAudio: () => void;
}): ReactElement {
  return (
    <div>
      <button onClick={() => reviewCard(false)}>Answered incorrectly</button>
      <button onClick={() => playAudio()}>Listen again</button>
      <button onClick={() => reviewCard(true)}>Answered correctly</button>
    </div>
  );
}
