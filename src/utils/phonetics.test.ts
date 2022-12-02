import assert from "assert";
import {
  normalizeAndRemovePunctuation,
  removeTonesAndMarkers,
} from "./phonetics";

describe("removeTonesAndVowelLength", () => {
  it.each([
    ["sǔ:dáli", "sudali"],
    ["Sa:sa aná:ɂi", "sasa anai"],
    ["U:ni:ji:ya dù:hyoha na asgaya", "unijiya duhyoha na asgaya"],
  ])("works for a bunch of examples", (richPhonetics, expected) => {
    const actual = removeTonesAndMarkers(
      normalizeAndRemovePunctuation(richPhonetics)
    );
    assert.deepStrictEqual(actual, expected, "Should produce expected output");
  });
});
