import jest from "jest";
import { renderHook, act } from "@testing-library/react";
import assert from "assert";
import { Card, keyForCard } from "../data/clean-cll-data";
import { MissingCardsError } from "./useCachedLeitnerBoxes";
import { useCardsForTerms } from "./useCardsForTerms";
import { useLeitnerBoxes } from "./useLeitnerBoxes";

const HOWA: Card = {
  cherokee: "howa.",
  cherokee_audio: ["CHEROKEE_FAKE_AUDIO"],
  english: "Okay.",
  english_audio: ["ENGLISH_FAKE_AUDIO"],
  alternate_pronounciations: [],
  alternate_syllabary: [],
  syllabary: "ᎰᏩ",
};

const WADO: Card = {
  cherokee: "wado.",
  cherokee_audio: ["CHEROKEE_FAKE_AUDIO"],
  english: "Thanks.",
  english_audio: ["ENGLISH_FAKE_AUDIO"],
  alternate_pronounciations: [],
  alternate_syllabary: [],
  syllabary: "ᏩᏙ",
};

const GOHUSDI_OSDA: Card = {
  cherokee: "go:hű:sdi ő:sda.",
  cherokee_audio: ["CHEROKEE_FAKE_AUDIO"],
  english: "Something good.",
  english_audio: ["ENGLISH_FAKE_AUDIO"],
  alternate_pronounciations: [],
  alternate_syllabary: [],
  syllabary: "ᎪᎱᏍᏗ ᎣᏍᏓ",
};

const cards: Card[] = [HOWA, WADO, GOHUSDI_OSDA];

describe("useCardsForTerms", () => {
  it("looks up cards by term/key", () => {
    const originalCards = [GOHUSDI_OSDA, HOWA, WADO];
    const terms = originalCards.map(keyForCard);
    const { result } = renderHook(() =>
      useCardsForTerms(cards, terms, keyForCard)
    );
    assert.deepStrictEqual(result.current, {
      [keyForCard(GOHUSDI_OSDA)]: GOHUSDI_OSDA,
      [keyForCard(HOWA)]: HOWA,
      [keyForCard(WADO)]: WADO,
    });
  });

  it("throws when cards cannot be found", () => {
    const originalCards = [GOHUSDI_OSDA, HOWA, WADO];
    const terms = originalCards.map(keyForCard);
    try {
      const { result } = renderHook(() =>
        useCardsForTerms(cards, [...terms, "NOT A CARD"], keyForCard)
      );
    } catch (error) {
      assert(error instanceof MissingCardsError);
      assert.deepStrictEqual(error.missingCards, ["NOT A CARD"]);
    }
  });
});

describe("useLeitnerBoxes", () => {
  it("can be loaded from a saved state", () => {
    const initialState = {
      numBoxes: 5,
      terms: {
        foo: {
          box: 0,
          key: "foo",
          lastShown: 0,
          nextShowTime: 0,
        },
        bar: {
          box: 0,
          key: "bar",
          lastShown: 0,
          nextShowTime: 0,
        },
        baz: {
          box: 0,
          key: "baz",
          lastShown: 0,
          nextShowTime: 0,
        },
      },
    };
    const { result } = renderHook(() =>
      useLeitnerBoxes({
        state: initialState,
        type: "LOAD",
      })
    );
    assert.deepStrictEqual(result.current.state, initialState);
  });

  it("can be initialized", () => {
    const { result } = renderHook(() =>
      useLeitnerBoxes({
        initialTerms: ["foo", "bar", "baz"],
        numBoxes: 5,
        type: "NEW",
      })
    );
    assert.deepStrictEqual(result.current.state, {
      numBoxes: 5,
      terms: {
        foo: {
          box: 0,
          key: "foo",
          lastShown: 0,
          nextShowTime: 0,
        },
        bar: {
          box: 0,
          key: "bar",
          lastShown: 0,
          nextShowTime: 0,
        },
        baz: {
          box: 0,
          key: "baz",
          lastShown: 0,
          nextShowTime: 0,
        },
      },
    });
  });

  describe("tracks term boxes as they are reviewed", () => {
    it("advances terms when answered correctly, up to the last box", () => {
      const { result } = renderHook(() =>
        useLeitnerBoxes({
          initialTerms: ["foo", "bar", "baz"],
          numBoxes: 5,
          type: "NEW",
        })
      );
      act(() => {
        result.current.reviewTerm("foo", true);
      });
      assert.deepStrictEqual(result.current.state.terms.foo.box, 1);

      act(() => {
        result.current.reviewTerm("foo", true);
      });
      assert.deepStrictEqual(result.current.state.terms.foo.box, 2);

      act(() => {
        result.current.reviewTerm("foo", true);
      });
      assert.deepStrictEqual(result.current.state.terms.foo.box, 3);

      act(() => {
        result.current.reviewTerm("foo", true);
      });
      assert.deepStrictEqual(result.current.state.terms.foo.box, 4);

      act(() => {
        result.current.reviewTerm("foo", true);
      });
      assert.deepStrictEqual(result.current.state.terms.foo.box, 4);
    });

    it("keeps terms in the first box when answered incorrectly", () => {
      const { result } = renderHook(() =>
        useLeitnerBoxes({
          initialTerms: ["foo", "bar", "baz"],
          numBoxes: 5,
          type: "NEW",
        })
      );
      act(() => {
        result.current.reviewTerm("bar", false);
      });
      assert.deepStrictEqual(result.current.state.terms.bar.box, 0);
    });

    it("returns terms to the first box when answered incorrectly", () => {
      const { result } = renderHook(() =>
        useLeitnerBoxes({
          initialTerms: ["foo", "bar", "baz"],
          numBoxes: 5,
          type: "NEW",
        })
      );
      act(() => {
        result.current.reviewTerm("baz", true);
      });
      assert.deepStrictEqual(result.current.state.terms.baz.box, 1);
      act(() => {
        result.current.reviewTerm("baz", true);
      });
      assert.deepStrictEqual(result.current.state.terms.baz.box, 2);
      act(() => {
        result.current.reviewTerm("baz", false);
      });
      assert.deepStrictEqual(result.current.state.terms.baz.box, 0);
    });
  });
});
