import assert from "assert";
import jest from "jest";
import { Card } from "../clean-cll-data";
import {
  deserializeLeitnerBoxState,
  KeyedLeitnerBoxState,
  MissingCardsError,
  serializeLeitnerBoxState,
} from "./useCachedLeitnerBoxes";
import { flattenBoxes, LeitnerBoxState } from "./useLeitnerBoxes";

const HOWA: Card = {
  cherokee: "howa.",
  cherokee_audio: ["CHEROKEE_FAKE_AUDIO"],
  english: "Okay.",
  english_audio: ["ENGLISH_FAKE_AUDIO"],
};

const WADO: Card = {
  cherokee: "wado.",
  cherokee_audio: ["CHEROKEE_FAKE_AUDIO"],
  english: "Thanks.",
  english_audio: ["ENGLISH_FAKE_AUDIO"],
};

const GOHUSDI_OSDA = {
  cherokee: "go:hű:sdi ő:sda.",
  cherokee_audio: ["CHEROKEE_FAKE_AUDIO"],
  english: "Something good.",
  english_audio: ["ENGLISH_FAKE_AUDIO"],
};

const cards: Card[] = [HOWA, WADO, GOHUSDI_OSDA];

const GOHUSDI_OSDA_2 = {
  cherokee: "go:hű:sdi ő:sda.",
  cherokee_audio: ["CHEROKEE_FAKE_AUDIO"],
  english: "Something good.",
  english_audio: ["NEW_ENGLISH_FAKE_AUDIO"],
};
const updatedCards: Card[] = [HOWA, WADO, GOHUSDI_OSDA_2];

const boxes = [[GOHUSDI_OSDA], [HOWA, WADO]];
const deserializedState: LeitnerBoxState<Card> = {
  boxes,
  cardsToReview: flattenBoxes(boxes),
};
const keyedBoxes = [["go:hű:sdi ő:sda."], ["howa.", "wado."]];
const keyedState: KeyedLeitnerBoxState = {
  boxes: keyedBoxes,
  cardsToReview: flattenBoxes(keyedBoxes),
};

const expectedUpdatedBoxes = [[GOHUSDI_OSDA_2], [HOWA, WADO]];
const expectedUpdatedState: LeitnerBoxState<Card> = {
  boxes: expectedUpdatedBoxes,
  cardsToReview: flattenBoxes(expectedUpdatedBoxes),
};

describe("serialization for LeitnerBoxState", () => {
  it("serializes states", () => {
    assert.deepStrictEqual(
      serializeLeitnerBoxState(deserializedState),
      keyedState
    );
  });

  it("deserializes states", () => {
    assert.deepStrictEqual(
      deserializeLeitnerBoxState(cards, keyedState),
      deserializedState
    );
  });

  it("deserialization catches updates", () => {
    assert.deepStrictEqual(
      deserializeLeitnerBoxState(updatedCards, keyedState),
      expectedUpdatedState
    );
  });

  it("does something reasonable when a card can't be found", () => {
    try {
      deserializeLeitnerBoxState(cards, {
        boxes: [["FOO"], ["howa."]],
        cardsToReview: [
          {
            card: "BAR",
            box: 0,
          },
          {
            card: "BAZ",
            box: 0,
          },
          {
            card: "howa.",
            box: 0,
          },
        ],
      });
    } catch (error) {
      assert(error instanceof MissingCardsError);
      assert.deepStrictEqual(error.missingFromBoxes, ["FOO"]);
      assert.deepStrictEqual(error.missingFromToReview, ["BAR", "BAZ"]);
    }
  });
});
