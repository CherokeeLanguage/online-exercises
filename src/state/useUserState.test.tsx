import { UserState, UserStateProps, useUserState } from "./useUserState";
import { renderHook, act } from "@testing-library/react";
import {
  CHEROKEE_LANGUAGE_LESSONS_COLLLECTION,
  collections,
  SEE_SAY_WRITE_COLLECTION,
} from "../data/vocabSets";
import assert from "assert";
import { TermStats } from "../spaced-repetition/types";
import { MockAuthProvider } from "../firebase/AuthProvider";
import { LessonCreationError } from "./reducers/lessons/createNewLesson";

function renderUserStateHook(props: {
  storedUserState?:
    | (Omit<UserState, "ephemeral"> & {
        ephemeral?:
          | { lessonCreationError: LessonCreationError | null }
          | undefined;
      })
    | undefined;
  initializationProps: UserStateProps;
}) {
  return renderHook(() => useUserState(props), {
    wrapper: ({ children }) => (
      <MockAuthProvider userId="TEST_ID">{children}</MockAuthProvider>
    ),
  });
}

describe("useUserState", () => {
  const now = 1661985522163;
  const realNow = Date.now;

  beforeAll(() => {
    // for some reason jest won't mock this properly
    global.Date.now = () => now;
  });

  afterAll(() => {
    global.Date.now = realNow;
  });

  describe("adding sets", () => {
    it("adds sets correctly to blank states", () => {
      const setToAdd =
        collections[CHEROKEE_LANGUAGE_LESSONS_COLLLECTION].sets[0];

      const ref = renderUserStateHook({
        initializationProps: {
          leitnerBoxes: {
            numBoxes: 6,
          },
        },
      });

      act(() => ref.result.current.interactors.addSet(setToAdd.id));

      expect(ref.result.current.state).toEqual({
        leitnerBoxes: {
          terms: Object.fromEntries(
            setToAdd.terms.map((t) => [
              t,
              {
                key: t,
                box: 0,
                lastShownDate: 0,
                nextShowDate: expect.any(Number),
              },
            ])
          ),
          numBoxes: 6,
        },
        ephemeral: {
          lessonCreationError: null,
        },
        config: {
          sets: {
            [setToAdd.id]: {
              setId: setToAdd.id,
              addedAt: now,
            },
          },
          upstreamCollection: null,
          groupId: null,
          phoneticsPreference: null,
          userEmail: null,
        },
      });
    });

    it("adds sets correctly when some terms have already been added", () => {
      const setToAdd =
        collections[CHEROKEE_LANGUAGE_LESSONS_COLLLECTION].sets[0];

      const termAlreadyAdded = setToAdd.terms[0];
      const expectedNewTerms = setToAdd.terms.slice(1);
      const existingTermStats: TermStats = {
        box: 0,
        key: termAlreadyAdded,
        // not normal
        lastShownDate: -1000,
        nextShowDate: 0,
      };

      const ref = renderUserStateHook({
        storedUserState: {
          leitnerBoxes: {
            terms: {
              [termAlreadyAdded]: existingTermStats,
            },
            numBoxes: 6,
          },
          ephemeral: {
            lessonCreationError: null,
          },
          config: {
            sets: {},
            upstreamCollection: null,
            groupId: null,
            phoneticsPreference: null,
            userEmail: null,
            whereFound: null,
          },
        },
        initializationProps: {
          leitnerBoxes: {
            numBoxes: 6,
          },
        },
      });

      act(() => ref.result.current.interactors.addSet(setToAdd.id));

      assert.deepStrictEqual(ref.result.current.state.config.sets, {
        [setToAdd.id]: {
          setId: setToAdd.id,
          addedAt: now,
        },
      });

      assert.deepStrictEqual(
        Object.keys(ref.result.current.state.leitnerBoxes.terms),
        setToAdd.terms
      );

      expect(ref.result.current.state).toEqual({
        leitnerBoxes: {
          terms: Object.fromEntries([
            ...setToAdd.terms.map((t) => [
              t,
              {
                key: t,
                box: 0,
                lastShownDate: 0,
                nextShowDate: expect.any(Number),
              },
            ]),
            // expect existing term to have old states
            [termAlreadyAdded, existingTermStats],
          ]),
          numBoxes: 6,
        },
        ephemeral: {
          lessonCreationError: null,
        },
        config: {
          sets: {
            [setToAdd.id]: {
              setId: setToAdd.id,
              addedAt: now,
            },
          },
          upstreamCollection: null,
          groupId: null,
          phoneticsPreference: null,
          userEmail: null,
        },
      });
    });
  });

  describe("removing sets", () => {
    it("removes sets entirely when only terms from that set have been added", () => {
      const setToAddThenRemove =
        collections[CHEROKEE_LANGUAGE_LESSONS_COLLLECTION].sets[0];

      const ref = renderUserStateHook({
        initializationProps: {
          leitnerBoxes: {
            numBoxes: 6,
          },
        },
      });

      act(() => ref.result.current.interactors.addSet(setToAddThenRemove.id));
      // we already test to ensure it was added correctly
      act(() =>
        ref.result.current.interactors.removeSet(setToAddThenRemove.id)
      );

      // all terms and sets should be removed
      expect(ref.result.current.state).toEqual<UserState>({
        leitnerBoxes: {
          terms: {},
          numBoxes: 6,
        },
        ephemeral: {
          lessonCreationError: null,
        },
        config: {
          sets: {},
          upstreamCollection: null,
          groupId: null,
          phoneticsPreference: null,
          userEmail: null,
          whereFound: null,
        },
      });
    });

    it("removes only unique terms when multiple sets have been added", () => {
      // pick two different sets which have a term in common
      const AYV = "ayv";
      const cllSetWithAyv = collections[
        CHEROKEE_LANGUAGE_LESSONS_COLLLECTION
      ].sets.find((s) => s.terms.includes(AYV));
      const sswSetWithAyv = collections[SEE_SAY_WRITE_COLLECTION].sets.find(
        (s) => s.terms.includes(AYV)
      );

      // both must exist
      assert(cllSetWithAyv);
      assert(sswSetWithAyv);

      const ref = renderUserStateHook({
        initializationProps: {
          leitnerBoxes: {
            numBoxes: 6,
          },
        },
      });

      act(() => ref.result.current.interactors.addSet(cllSetWithAyv.id));
      act(() => ref.result.current.interactors.addSet(sswSetWithAyv.id));
      act(() => ref.result.current.interactors.removeSet(cllSetWithAyv.id));

      // only one set should be left
      expect(ref.result.current.state).toEqual({
        leitnerBoxes: {
          // expect only (but all) ssw terms
          terms: Object.fromEntries(
            sswSetWithAyv.terms.map((t) => [
              t,
              {
                key: t,
                box: 0,
                lastShownDate: 0,
                nextShowDate: expect.any(Number),
              },
            ])
          ),
          numBoxes: 6,
        },
        ephemeral: {
          lessonCreationError: null,
        },
        config: {
          sets: {
            [sswSetWithAyv.id]: {
              setId: sswSetWithAyv.id,
              addedAt: now,
            },
          },
          upstreamCollection: null,
          groupId: null,
          phoneticsPreference: null,
          userEmail: null,
        },
      });
    });
  });
});
