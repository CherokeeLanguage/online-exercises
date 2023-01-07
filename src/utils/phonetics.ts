import { Card, PhoneticOrthography } from "../data/cards";
import { PhoneticsPreference } from "../state/reducers/phoneticsPreference";

export function getPhonetics(
  card: Card,
  phoneticsPreference: PhoneticsPreference | undefined
): string {
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
      return normalizeAndRemovePunctuation(cherokee);
  }
}

export function normalizeAndRemovePunctuation(cherokee: string): string {
  return cherokee
    .toLowerCase()
    .replaceAll(/[.?]/g, "")
    .replaceAll(/j/g, "ts")
    .replaceAll(/qu/g, "gw")
    .replaceAll(/[Ɂʔ]/g, "ɂ")
    .normalize("NFKD");
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

export function simplifyWebster(cherokee: string): string {
  return cherokee.replace(/¹²³⁴/g, "");
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
