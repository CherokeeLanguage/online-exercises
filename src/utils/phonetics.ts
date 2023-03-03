import { Card, PhoneticOrthography } from "../data/cards";
import { PhoneticsPreference } from "../state/reducers/phoneticsPreference";

export function getPhonetics(
  card: Card,
  phoneticsPreference: PhoneticsPreference | undefined
): string {
  // this should be the ONLY time we use NFC -- and it is for user presentation
  return getRawPhonetics(card, phoneticsPreference).normalize("NFC");
}

function getRawPhonetics(
  card: Card,
  phoneticsPreference: PhoneticsPreference | undefined
): string {
  switch (phoneticsPreference) {
    case PhoneticsPreference.Detailed:
      return detailedPhonetics(card);
    case PhoneticsPreference.Simple:
      return simplifyPhonetics(card);
    case undefined:
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
      .replaceAll(/([aeiouv])(?![¹²³⁴])(?=\w)/g, "$1²") // non-final vowel not followed by any tone yet
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

function prototypicalSyllable(syllabary: string): string {
  // handle Ꮝ-prefixed s sounds (eg. ᏍᏏᏉᏯ - sigwoya)
  if (syllabary.length == 2 && syllabary.startsWith("Ꮝ"))
    return prototypicalSyllable(syllabary[1]);

  // see https://en.wikipedia.org/wiki/Cherokee_(Unicode_block)
  if (["Ꮤ", "Ꮨ", "Ꮦ"].includes(syllabary)) return "Ꮤ";
  if (["Ꭷ", "Ꮝ", "Ꮏ", "Ᏽ", "Ꮬ", "Ꮏ", ".", "?", ",", "!"].includes(syllabary))
    return syllabary;

  const breaks = [
    "Ꭰ",
    "Ꭶ",
    "Ꭽ",
    "Ꮃ",
    "Ꮉ",
    "Ꮎ",
    "Ꮖ",
    "Ꮜ",
    "Ꮣ",
    "Ꮭ",
    "Ꮳ",
    "Ꮹ",
    "Ꮿ",
  ];
  const breakCodes = breaks.map((b) => b.charCodeAt(0));
  const syllabaryCode = syllabary.charCodeAt(0);
  const hit =
    breakCodes.length -
    1 -
    breakCodes.reverse().findIndex((code) => code <= syllabaryCode);
  if (hit === breakCodes.length)
    throw new Error(
      `Could not find prototypical representation for: ${syllabary}`
    );

  return breaks[hit];
}

function alignSyllabaryAndPhoneticsWord(
  syllabary: string,
  phonetics: string
): [string[], string[]] {
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
  };

  const [_remaining, splitSyllabary, splitPhonetics] = syllabary
    .trim()
    .split("")
    .reduce<string[]>(
      (fixed, nextCharacter) =>
        prototypicalSyllable(nextCharacter) === "Ꮜ" &&
        fixed[fixed.length - 1] === "Ꮝ"
          ? [...fixed.slice(0, fixed.length - 1), "Ꮝ" + nextCharacter]
          : [...fixed, nextCharacter],
      []
    )
    .reduce<[string, string[], string[]]>(
      (
        [remainingPhonetics, splitSyllabary, splitPhonetics],
        syllabaryCharacter
      ) => {
        const nextRegexp =
          syllabarySounds[prototypicalSyllable(syllabaryCharacter)];
        if (nextRegexp === undefined)
          throw new Error(`No regexp found for: ${syllabaryCharacter}`);
        const matchRes = nextRegexp.exec(remainingPhonetics);
        if (matchRes === null)
          throw new Error(
            `Could not match next syllabary grapheme [${phonetics} / ${syllabary}]: ${remainingPhonetics}, ${syllabaryCharacter}, ${prototypicalSyllable(
              syllabaryCharacter
            )}, ${nextRegexp}`
          );
        const foundAt = matchRes.index;
        const matchedPhonetics = matchRes[0];
        if (foundAt > 1)
          throw new Error(
            `Match found too deep [${phonetics} / ${syllabary}]: ${remainingPhonetics} --> ${matchedPhonetics} (${nextRegexp})`
          );
        if (
          foundAt === 1 &&
          remainingPhonetics[0] !== "h" &&
          remainingPhonetics[0] !== "ɂ"
        )
          throw new Error(
            `Match expected intrusive h [${phonetics} / ${syllabary}]: ${remainingPhonetics}, ${nextRegexp}, ${splitPhonetics}`
          );

        // console.log(
        //   remainingPhonetics,
        //   syllabaryCharacter,
        //   prototypicalSyllable(syllabaryCharacter),
        //   matchedPhonetics
        // );
        return [
          remainingPhonetics.substring(matchedPhonetics.length + foundAt),
          [...splitSyllabary, syllabaryCharacter],
          [
            ...splitPhonetics,
            remainingPhonetics.substring(0, matchedPhonetics.length + foundAt),
          ],
        ];
      },
      [phonetics.trim(), [], []]
    );

  // rest: do the thing shit...
  return [splitSyllabary, splitPhonetics];
}

export function alignSyllabaryAndPhonetics(
  syllabary: string,
  phonetics: string
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
      const [newSyllabarySplit, newPhoneticsSplit] =
        alignSyllabaryAndPhoneticsWord(syllabaryWord, phoneticsWords[idx]);
      return [
        [...syllabarySplit, newSyllabarySplit],
        [...phoneticsSplit, newPhoneticsSplit],
      ];
    },
    [[], []]
  );
}
