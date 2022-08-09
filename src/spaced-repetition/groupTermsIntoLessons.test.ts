import {
  groupTermsIntoLessons,
  MAX_CHALLENGES_PER_SESSION,
} from "./groupTermsIntoLessons";
import { getToday } from "../utils/dateUtils";
import assert from "assert";
import { showsPerSessionForBox } from "./usePimsleurTimings";

const today = getToday();

describe("groupTermsIntoLessons", () => {
  it("creates a single lesson when there are a small number of terms", () => {
    const actual = groupTermsIntoLessons([
      {
        box: 0,
        key: "foo",
        lastShownDate: 0,
        nextShowDate: today,
      },
      {
        box: 2,
        key: "bar",
        lastShownDate: 0,
        nextShowDate: today,
      },
      {
        box: 1,
        key: "baz",
        lastShownDate: 0,
        nextShowDate: today,
      },
    ]);
    assert.deepStrictEqual(actual, [
      [
        {
          box: 0,
          key: "foo",
          lastShownDate: 0,
          nextShowDate: today,
        },
        {
          box: 2,
          key: "bar",
          lastShownDate: 0,
          nextShowDate: today,
        },
        {
          box: 1,
          key: "baz",
          lastShownDate: 0,
          nextShowDate: today,
        },
      ],
    ]);
  });

  describe("splits terms into multiple lessons when there are too many for a single lesson", () => {
    it("works with all new terms", () => {
      const allTerms = [
        "a",
        "b",
        "c",
        "d",
        "e",
        "f",
        "g",
        "h",
        "i",
        "j",
        "k",
        "l",
        "m",
        "n",
        "o",
        "p",
      ].map((key) => ({ key, box: 0, lastShownDate: 0, nextShowDate: today }));

      const expectedTermsInFirstLesson = Math.floor(
        MAX_CHALLENGES_PER_SESSION / showsPerSessionForBox(0)
      );
      const expectedTermsInSecondLesson =
        allTerms.length - expectedTermsInFirstLesson;
      const actual = groupTermsIntoLessons(allTerms);
      assert.deepStrictEqual(actual.length, 2);

      assert.deepStrictEqual(actual[0].length, expectedTermsInFirstLesson);
      assert.deepStrictEqual(actual[1].length, expectedTermsInSecondLesson);

      assert.deepStrictEqual(
        actual[0],
        allTerms.slice(0, expectedTermsInFirstLesson)
      );
      assert.deepStrictEqual(
        actual[1],
        allTerms.slice(expectedTermsInFirstLesson)
      );
    });

    it("works with non-new terms", () => {
      const allTerms = [
        "a",
        "b",
        "c",
        "d",
        "e",
        "f",
        "g",
        "h",
        "i",
        "j",
        "k",
        "l",
        "m",
        "n",
        "o",
        "p",
      ].map((key) => ({ key, box: 1, lastShownDate: 0, nextShowDate: today }));

      const expectedTermsInFirstLesson = Math.floor(
        MAX_CHALLENGES_PER_SESSION / showsPerSessionForBox(1)
      );
      const expectedTermsInSecondLesson =
        allTerms.length - expectedTermsInFirstLesson;
      const actual = groupTermsIntoLessons(allTerms);
      assert.deepStrictEqual(actual.length, 2);

      assert.deepStrictEqual(actual[0].length, expectedTermsInFirstLesson);
      assert.deepStrictEqual(actual[1].length, expectedTermsInSecondLesson);

      assert.deepStrictEqual(
        actual[0],
        allTerms.slice(0, expectedTermsInFirstLesson)
      );
      assert.deepStrictEqual(
        actual[1],
        allTerms.slice(expectedTermsInFirstLesson)
      );
    });
  });
});
