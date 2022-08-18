import assert from "assert";
import "jest";
import { scanWhile } from "./createNewLesson";

describe("scanWhile", () => {
  it("takes until the predicate is met", () => {
    const [items, count] = scanWhile(
      [1, 2, 3, 4],
      (count, e) => count + e,
      (count, e) => count + e < 10,
      0
    );
    assert.deepStrictEqual(items, [1, 2, 3]);
    assert.deepStrictEqual(count, 6);
  });

  it("will take the whole list if the predicate is met for every item in the list", () => {
    const [items, count] = scanWhile(
      [1, 2, 3, 4],
      (count, e) => count + e,
      () => true, // always return true
      0
    );
    assert.deepStrictEqual(items, [1, 2, 3, 4]);
    assert.deepStrictEqual(count, 10);
  });
});
