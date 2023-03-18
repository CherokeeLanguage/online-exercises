import assert from "assert";
import {
  maskTonesOnSyllable,
  toneSyllables,
  validWordsToHide,
} from "./WriteTheTones";

describe("validWordsToHide", () => {
  it("works once", () => {
    const phonetics = "do² u²²lsta²nv ka²³w a²tli²²sdo²hdi";
    const wordsWithAtLeastTwoTones = validWordsToHide(phonetics.split(" "));

    assert.deepStrictEqual(wordsWithAtLeastTwoTones, [
      [1, "u²²lsta²nv"],
      [2, "ka²³w"],
      [3, "a²tli²²sdo²hdi"],
    ]);
  });
});

describe("toneSyllables", () => {
  it("it works once", () => {
    const phonetics = "u²²lsta²nv";
    const syllables = toneSyllables(phonetics);
    assert.deepStrictEqual(syllables, ["u²²", "lsta²", "nv"]);
  });
});

describe("maskTonesOnSyllable", () => {
  it.each<[string, number, string[], string]>([
    ["u²²lsta²nv", 0, ["u", "lsta²", "nv"], "²²"],
    ["ka²³w", 0, ["ka", "w"], "²³"],
    ["a²tli²²sdo²hdi", 2, ["a²", "tli²²", "sdo", "hdi"], "²"],
    ["sgo¹¹", 0, ["sgo"], "¹¹"],
  ])(
    "it works idk",
    (phonetics, hideIdx, expectedMaskedWord, expectedTones) => {
      const syllables = toneSyllables(phonetics);
      const [wordWithoutTone, tones] = maskTonesOnSyllable(syllables, hideIdx);
      assert.deepStrictEqual(wordWithoutTone, expectedMaskedWord);
      assert.deepStrictEqual(tones, expectedTones);
    }
  );
});
