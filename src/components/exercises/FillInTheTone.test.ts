import assert from "assert";
import { alignSyllabaryAndPhonetics } from "../../utils/phonetics";
import { maskTonesOnSyllable, validWordsToHide } from "./FillInTheTone";

describe("validWordsToHide", () => {
  it("works once", () => {
    const phonetics = [
      ["do²"],
      ["u²²", "l", "s", "ta²", "nv"],
      ["ka²³", "w"],
      ["a²", "tli²²", "s", "do²", "hdi"],
    ];
    const wordsWithAtLeastTwoTones = validWordsToHide(phonetics);

    assert.deepStrictEqual(wordsWithAtLeastTwoTones, [
      [1, "u²²lsta²nv"],
      [2, "ka²³w"],
      [3, "a²tli²²sdo²hdi"],
    ]);
  });
});

describe("maskTonesOnSyllable", () => {
  it.each<[string, string, number, string[], string]>([
    ["ᎤᎵᏍᏔᏅ", "u²²lsta²nv", 0, ["u", "l", "s", "ta²", "nv"], "²²"],
    ["ᎧᏫ", "ka²³w", 0, ["ka", "w"], "²³"],
    ["ᎠᏟᏍᏙᏗ", "a²tli²²sdo²hdi", 3, ["a²", "tli²²", "s", "do", "hdi"], "²"],
    ["ᏍᎪ", "sgo¹¹", 1, ["s", "go"], "¹¹"],
  ])(
    "it works idk",
    (syllabary, phonetics, hideIdx, expectedMaskedWord, expectedTones) => {
      const [_, [phoneticsSyllablesOfFirstWord]] = alignSyllabaryAndPhonetics(
        syllabary,
        phonetics
      );
      const [wordWithoutTone, tones] = maskTonesOnSyllable(
        phoneticsSyllablesOfFirstWord,
        hideIdx
      );
      assert.deepStrictEqual(wordWithoutTone, expectedMaskedWord);
      assert.deepStrictEqual(tones, expectedTones);
    }
  );
});
