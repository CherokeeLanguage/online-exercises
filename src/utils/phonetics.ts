import { Card, PhoneticOrthography } from "../data/cards";
import { PhoneticsPreference } from "../state/reducers/phoneticsPreference";

export function getPhonetics(
  card: Card,
  phoneticsPreference: PhoneticsPreference | null
): string {
  // this should be the ONLY time we use NFC -- and it is for user presentation
  return getRawPhonetics(card, phoneticsPreference).normalize("NFC");
}

function getRawPhonetics(
  card: Card,
  phoneticsPreference: PhoneticsPreference | null
): string {
  switch (phoneticsPreference) {
    case PhoneticsPreference.Detailed:
      return detailedPhonetics(card);
    case PhoneticsPreference.Simple:
      return simplifyPhonetics(card);
    case null:
    case PhoneticsPreference.NoPhonetics:
      return "";
  }
}

function detailedPhonetics({ cherokee, phoneticOrthography }: Card) {
  switch (phoneticOrthography) {
    case PhoneticOrthography.MCO:
      return mcoToWebsterTones(normalizeAndRemovePunctuation(cherokee));
    case PhoneticOrthography.WEBSTER:
      return removeDropVowelsWebster(normalizeAndRemovePunctuation(cherokee));
  }
}

export function normalizeAndRemovePunctuation(cherokee: string): string {
  return cherokee
    .toLowerCase()
    .replaceAll(/[.?]/g, "")
    .replaceAll(/j/g, "ts")
    .replaceAll(/qu/g, "gw")
    .replaceAll(/[Ɂʔ]/g, "ɂ")
    .replaceAll(/ː/g, ":")
    .normalize("NFD");
}

export function mcoToWebsterTones(cherokee: string): string {
  // ¹²³⁴
  // conversion based on Uchihara 2013, p. 14
  return (
    cherokee
      .replaceAll(/\u0304/g, "") // remove macron accents if present (just mark low tone)
      .replaceAll(/([aeiouv])\u0300:/g, "$1¹¹") // combining grave accent, long
      .replaceAll(/([aeiouv]):/g, "$1²²") // long vowel with no diacritic
      .replaceAll(/([aeiouv])\u0301:/g, "$1³³") // combining acute accent, long
      .replaceAll(/([aeiouv])\u030C:/g, "$1²³") // combining caron accent, long
      .replaceAll(/([aeiouv])\u0302:/g, "$1³²") // combining circumflex accent, long
      .replaceAll(/([aeiouv])\u030B:/g, "$1⁴⁴") // combining double acute accent, long
      .replaceAll(/([aeiouv])\u030B/g, "$1⁴") // combining double acute accent, short (in cases where a final vowel is dropped and a highfall tone must become short)
      // BEGIN long vowels that need to be shortened because they are last in a word
      .replaceAll(/([aeiouv])\u030C(?=\s|$)/g, "$1²$2") // combining caron accent, short
      .replaceAll(/([aeiouv])\u0302(?=\s|$)/g, "$1³$2") // combining circumflex accent, short
      .replaceAll(/([aeiouv])\u0300/g, "$1¹") // combining grave accent, short
      .replaceAll(/([aeiouv])\u0301/g, "$1³") // combining acute accent, short
      .replaceAll(/([aeiouv])(?![¹²³⁴])(?=[ɂ\w])/g, "$1²") // non-final vowel not followed by any tone yet
  );
}

export function simplifyMCO(cherokee: string): string {
  return cherokee.replace(/[:\u0300-\u036f]/g, "");
}

export function removeDropVowelsWebster(cherokee: string): string {
  // JW's notation for drop vowel
  return cherokee.replace(/[aeiouv],/g, "");
}

export function simplifyWebster(cherokee: string): string {
  return removeDropVowelsWebster(cherokee.replace(/[¹²³⁴]/g, ""));
}

export function simplifyPhonetics({
  cherokee,
  phoneticOrthography,
}: Card): string {
  switch (phoneticOrthography) {
    case PhoneticOrthography.MCO:
      return simplifyMCO(normalizeAndRemovePunctuation(cherokee));
    case PhoneticOrthography.WEBSTER:
      return simplifyWebster(normalizeAndRemovePunctuation(cherokee));
  }
}

function prototypicalSyllable(grapheme: string): string {
  if (grapheme.length == 2) {
    const secondProto = prototypicalSyllable(grapheme[1]);
    // handle Ꮝ-prefixed s sounds (eg. ᏍᏏᏉᏯ - sigwoya), by pretending first Ꮝ isn't there
    if (grapheme[0] === "Ꮝ" && secondProto === "Ꮜ") return "Ꮜ";
    else return prototypicalSyllable(grapheme[0]) + secondProto;
  }

  // see https://en.wikipedia.org/wiki/Cherokee_(Unicode_block)
  if (["Ꮤ", "Ꮨ", "Ꮦ"].includes(grapheme)) return "Ꮤ";
  if (["Ꭷ", "Ꮝ", "Ꮏ", "Ᏽ", "Ꮬ", "Ꮏ", ".", "?", ",", "!"].includes(grapheme))
    return grapheme;

  // list MUST BE in reverse alphabetical order (by unicode codepoint)
  // to reverse sort in vi, select the block and run :sort!
  const breaks = [
    "Ꮿ",
    "Ꮹ",
    "Ꮳ",
    "Ꮭ",
    "Ꮣ",
    "Ꮜ",
    "Ꮖ",
    "Ꮎ",
    "Ꮉ",
    "Ꮃ",
    "Ꭽ",
    "Ꭶ",
    "Ꭰ",
  ];
  const breakCodes = breaks.map((b) => b.charCodeAt(0));
  const graphemeCode = grapheme.charCodeAt(0);
  const hit = breakCodes.findIndex((code) => code <= graphemeCode);
  if (hit === -1)
    throw new Error(
      `Could not find prototypical representation for: ${grapheme}`
    );

  return breaks[hit];
}

const syllabarySounds: Record<string, RegExp> = {
  ".": /\.?/,
  ",": /,?/,
  "?": /\??/,
  "!": /\!?/,
  Ꭰ: /[aeiouv][¹²³⁴]*/,
  Ꭶ: /[gk]([aeiouv][¹²³⁴]*)?/,
  Ꭷ: /k([aeiouv][¹²³⁴]*)?/,
  Ꭽ: /h([aeiouv][¹²³⁴]*)?/,
  Ꮃ: /[ht]?l([aeiouv][¹²³⁴]*)?/,
  Ꮉ: /m([aeiouv][¹²³⁴]*)?/,
  Ꮎ: /n([aeiouv][¹²³⁴]*)?/,
  Ꮏ: /hn([aeiouv][¹²³⁴]*)?/,
  Ꮖ: /((gw)|(qu)|(kw))([aeiouv][¹²³⁴]*)?/,
  Ꮝ: /s(?![aeiouv])/, // s not followed by vowel
  Ꮜ: /s([aeiouv][¹²³⁴]*)?/, // always followed by vowel
  Ꮣ: /[td]([aeiouv][¹²³⁴]*)?/,
  Ꮤ: /t([aei][¹²³⁴]*)?/, // ta only represents ta, ti, te
  Ꮭ: /((tl)|(hl)|(dl))([aeiouv][¹²³⁴]*)?/, // support tla for hla
  Ꮬ: /((tl)|(hl)|(dl))([aeiouv][¹²³⁴]*)?/, // dla
  Ꮳ: /((j)|(ts)|(ch))([aeiouv][¹²³⁴]*)?/,
  Ꮹ: /w([aeiouv][¹²³⁴]*)?/,
  Ꮿ: /y([aeiouv][¹²³⁴]*)?/,

  // FUSED SOUNDS
  // dropped Ꮝ sound in sgi/sgw pronoun 2sg>1sg.
  ᏍᎦ: /[kg]/,
  ᏍᏆ: /((gw)|(qu)|(kw))/,
  // fused h from second person set A pronoun
  ᏯᎭ: /y([aeiouv][¹²³⁴]*)?/,
  ᏩᎭ: /w([aeiouv][¹²³⁴]*)?/,
};

function lazyMapFind<T, U>(
  items: T[],
  map: (e: T) => U,
  predicate: (e: U) => boolean
): U | undefined {
  for (const elm of items) {
    const res = map(elm);
    if (predicate(res)) return res;
  }
}

function matchPrototypicalSyllable({
  graphemeProto,
  remainingPhonetics,
}: {
  remainingPhonetics: string;
  graphemeProto: string;
}): { matchedPhonetics: string; foundAt: number } | undefined {
  const nextRegexp = syllabarySounds[graphemeProto];
  if (nextRegexp === undefined)
    throw new Error(
      `No regexp found for prototypically grapheme: ${graphemeProto}`
    );
  const matchRes = nextRegexp.exec(remainingPhonetics);
  if (
    matchRes === null ||
    (matchRes.index > 0 &&
      // the following allows for intrusive /h/s ie. unmarked aspiration to be part of any syllable
      !["h", "ɂ"].includes(remainingPhonetics.substring(0, matchRes.index)))
  ) {
    return undefined;
  }

  const foundAt = matchRes.index;
  const matchedPhonetics = matchRes[0];

  return { matchedPhonetics, foundAt };
}

/**
 * Match a syllabary grapheme against a set of phonetics.
 * Handles fused sounds by first attempting to match unfused versions.
 * Returns `undefined` if the grapheme couldn't be matched.
 */
function matchGrapheme({
  syllabaryGrapheme,
  remainingPhonetics,
}: {
  syllabaryGrapheme: string;
  remainingPhonetics: string;
}):
  | {
      remainingPhonetics: string;
      splitPhonetics: string[];
      splitSyllabary: string[];
    }
  | undefined {
  const graphemeProto = prototypicalSyllable(syllabaryGrapheme);

  const thingsToTry =
    graphemeProto.length === 1
      ? [[syllabaryGrapheme]]
      : [syllabaryGrapheme.split(""), [syllabaryGrapheme]];

  const res = lazyMapFind(
    thingsToTry,
    (syllabaryGraphemesToMatch) =>
      syllabaryGraphemesToMatch.reduce<
        [string, string[], string[]] | undefined
      >(
        (accumulator, syllabaryGrapheme) => {
          if (accumulator === undefined) return undefined;

          const [remainingPhonetics, splitSyllabary, splitPhonetics] =
            accumulator;
          const graphemeProto = prototypicalSyllable(syllabaryGrapheme);
          const match = matchPrototypicalSyllable({
            remainingPhonetics,
            graphemeProto,
          });

          if (match)
            return [
              remainingPhonetics.substring(
                match.matchedPhonetics.length + match.foundAt
              ),
              [...splitSyllabary, syllabaryGrapheme],
              [
                ...splitPhonetics,
                remainingPhonetics.substring(
                  0,
                  match.matchedPhonetics.length + match.foundAt
                ),
              ],
            ];
          else {
            return undefined;
          }
        },
        [remainingPhonetics, [], []]
      ),
    (e) => e !== undefined
  );

  if (res) {
    const [remainingPhonetics, splitSyllabary, splitPhonetics] = res;
    return { remainingPhonetics, splitSyllabary, splitPhonetics };
  }
}

function alignSyllabaryAndPhoneticsWord(
  syllabary: string,
  phonetics: string
): [string[], string[]] {
  /**
   * Some speakers/writers will use Ꮝ before any sound starting with s, including Ꮜ,Ꮞ,etc.
   * This code merges an Ꮝ preceding a Ꮜ family character into one segment
   */
  function combinePossiblyFusedSounds(
    combined: string[],
    nextCharacter: string
  ) {
    const previousCharacter: string | undefined = combined[combined.length - 1];
    const previousProto: string | undefined =
      previousCharacter && prototypicalSyllable(previousCharacter);
    const nextProto = prototypicalSyllable(nextCharacter);
    // an s syllable proceeded by an Ꮝ can be fused
    // TODO: can this be solved like /h/ metathesis rules
    if (previousCharacter === "Ꮝ" && nextProto === "Ꮜ") {
      return [
        ...combined.slice(0, combined.length - 1), // chop off prev segment that contained Ꮝ
        "Ꮝ" + nextCharacter,
      ];
    }

    // identify prefix sounds that could fuse a pronominal h
    if (
      (previousProto === "Ꮿ" ||
        previousProto === "Ꮹ" ||
        previousProto === "Ꮎ") &&
      nextProto === "Ꭽ"
    ) {
      return [
        ...combined.slice(0, combined.length - 1), // chop off prev segment that contained prefix
        previousCharacter + nextCharacter,
      ];
    }

    // identify ᏍᎩ / ᏍᏆ 2sg -> 1sg pronoun
    if (
      previousCharacter === "Ꮝ" &&
      (nextCharacter === "Ꭹ" || nextProto === "Ꮖ")
    ) {
      return [
        ...combined.slice(0, combined.length - 1), // chop off prev segment that contained Ꮝ
        "Ꮝ" + nextCharacter,
      ];
    }

    return [...combined, nextCharacter];
  }

  const [_remaining, splitSyllabary, splitPhonetics] = syllabary
    .trim()
    .split("")
    .reduce<string[]>(combinePossiblyFusedSounds, [])
    .reduce<[string, string[], string[]]>(
      (
        [remainingPhonetics, splitSyllabary, splitPhonetics],
        syllabaryGrapheme
      ) => {
        const match = matchGrapheme({
          syllabaryGrapheme,
          remainingPhonetics,
        });

        if (!match) {
          throw new Error(
            `Failed to match ${syllabaryGrapheme} against ${remainingPhonetics}`
          );
        }

        return [
          match.remainingPhonetics,
          [...splitSyllabary, ...match.splitSyllabary],
          [...splitPhonetics, ...match.splitPhonetics],
        ];
      },
      [phonetics.trim(), [], []]
    );

  return [splitSyllabary, splitPhonetics];
}

/**
 * Present an array of aligned segments for syllabary and phonetics.
 * @param syllabary
 * @param phonetics
 * @param suppressErrors - if true words that fail to be matched will be aligned with syllabary on a per word basis.
 * @returns `[syllabaryWords, phoneticsWords]`, where each `*Words` array contains a list of string segements.
 */
export function alignSyllabaryAndPhonetics(
  syllabary: string,
  phonetics: string,
  suppressErrors = true
): [string[][], string[][]] {
  const syllabaryWords = syllabary
    .trim()
    .split(" ")
    .filter((w) => w.trim() !== "");
  const phoneticsWords = phonetics
    .trim()
    .split(" ")
    .filter((w) => w.trim() !== "");

  if (syllabaryWords.length !== phoneticsWords.length)
    throw new Error(
      `Not the same number of words in syllabary and phonetics!\n\t${syllabary}\n\t${phonetics}`
    );

  return syllabaryWords.reduce<[string[][], string[][]]>(
    ([syllabarySplit, phoneticsSplit], syllabaryWord, idx) => {
      try {
        const [newSyllabarySplit, newPhoneticsSplit] =
          alignSyllabaryAndPhoneticsWord(syllabaryWord, phoneticsWords[idx]);
        return [
          [...syllabarySplit, newSyllabarySplit],
          [...phoneticsSplit, newPhoneticsSplit],
        ];
      } catch (e) {
        if (suppressErrors) {
          return [
            [...syllabarySplit, [syllabaryWord]],
            [...phoneticsSplit, [phoneticsWords[idx]]],
          ];
        } else {
          throw e;
        }
      }
    },
    [[], []]
  );
}
