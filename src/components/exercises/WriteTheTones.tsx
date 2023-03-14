import React, { ReactElement, useMemo } from "react";
import styled from "styled-components";
import { PhoneticsPreference } from "../../state/reducers/phoneticsPreference";
import { useUserStateContext } from "../../state/UserStateProvider";
import { theme } from "../../theme";
import { createIssueForTermInNewTab } from "../../utils/createIssue";
import { getPhonetics } from "../../utils/phonetics";
import { useAudio } from "../../utils/useAudio";
import { AnswerCard, AnswersWithFeedback } from "../AnswersWithFeedback";
import { ExerciseComponentProps } from "./Exercise";

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

const possibleTones = ["¹¹", "²²", "³²", "²³", "³³", "⁴⁴", "²", "³"];
const MaskedSyllable = styled.mark`
  /* text-decoration: underline;
  text-decoration-thickness: 8; */
  font-weight: bold;
  background-color: ${theme.colors.WHITE};
  color: ${theme.colors.DARK_RED};
  border-bottom: 8px solid ${theme.colors.DARK_RED};
  display: inline-block;
`;

export function WriteTheTones({
  currentCard,
  reviewCurrentCard,
}: ExerciseComponentProps): ReactElement {
  const { groupId } = useUserStateContext();

  const phonetics = useMemo(
    () => getPhonetics(currentCard.card, PhoneticsPreference.Detailed),
    [currentCard]
  );

  const phoneticsWords = useMemo(() => phonetics.split(" "), [phonetics]);

  // a'ni makes this exploded
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

  const [allOptions, correctIdx] = useMemo(() => {
    const options = pickNRandom(
      possibleTones.filter((t) => t !== hiddenTone),
      3
    );
    const correctIdx = Math.floor(Math.random() * 4);
    options.splice(correctIdx, 0, hiddenTone);
    return [options, correctIdx];
  }, [hiddenTone]);

  // pick random voice to use
  const cherokeeAudio = useMemo(
    () => pickRandomElement(currentCard.card.cherokee_audio),
    [currentCard]
  );

  const { play } = useAudio({
    src: cherokeeAudio,
    autoplay: true,
  });

  return (
    <div style={{ maxWidth: "800px", margin: "auto" }}>
      <p>
        Here you can practice working with tone by filling in the missing tone
        sequence.
      </p>
      <div style={{ fontSize: 24 }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontWeight: "bold", fontSize: "2em" }}>
            {currentCard.card.syllabary}
          </p>
          <p>
            {phoneticsWords.map((word, idx) => (
              <>
                {idx > 0 && " "}
                {idx === maskedWordIdx ? (
                  <span>
                    {maskedSyllables.map((syllable, syllableIdx) =>
                      syllableIdx === maskedSyllableIdx ? (
                        <MaskedSyllable>
                          {syllable}
                          <sup>??</sup>
                        </MaskedSyllable>
                      ) : (
                        syllable
                      )
                    )}
                  </span>
                ) : (
                  <span>{word}</span>
                )}
              </>
            ))}
          </p>
        </div>
        <AnswersWithFeedback
          reviewCurrentCard={reviewCurrentCard}
          feedbackDuration={500}
        >
          {allOptions.map((option, idx) => (
            <AnswerCard correct={idx === correctIdx}>
              <span style={{ fontSize: 24 }}>
                {maskedSyllables[maskedSyllableIdx] + option}
              </span>
            </AnswerCard>
          ))}
        </AnswersWithFeedback>
        <button onClick={() => play()}>Listen again</button>
        <button
          onClick={() => createIssueForTermInNewTab(groupId, currentCard.term)}
        >
          Flag an issue with this term
        </button>
      </div>
    </div>
  );
}
