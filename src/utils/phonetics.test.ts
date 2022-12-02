import assert from "assert";
import { removeTonesAndMarkers } from "./phonetics";

describe("removeTonesAndVowelLength", () => {
  it.each([
    ["sǔ:dáli", "sudali"],
    ["sa:sa aná:ɂi", "sasa anai"],
    ["U:ni:ji:ya dù:hyoha na asgaya", "Unijiya duhyoha na asgaya"],
  ])("works for a bunch of examples", (richPhonetics, expected) => {
    const actual = removeTonesAndMarkers(richPhonetics);
    assert.deepStrictEqual(actual, expected, "Should produce expected output");
  });
});
