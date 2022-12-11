import { Card } from "../data/cards";
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
      return mcoToWebsterTones(normalizeAndRemovePunctuation(card.cherokee));
    case PhoneticsPreference.Simple:
      return simplifyPhonetics(card.cherokee);
    case undefined:
    case PhoneticsPreference.NoPhonetics:
      return "";
  }
}

export function normalizeAndRemovePunctuation(cherokee: string): string {
  return cherokee
    .toLowerCase()
    .replaceAll(/[.?]/g, "")
    .replaceAll(/(ch)|(j)/g, "ts")
    .replaceAll(/qu/g, "gw")
    .replaceAll(/[Ɂʔ]/g, "ɂ")
    .normalize("NFKD");
}

export function mcoToWebsterTones(cherokee: string): string {
  // ¹²³⁴
  // conversion based on Uchihara 2013, p. 14
  return cherokee
    .replaceAll(/([aeiouv])\u0300:/g, "$1¹¹") // combining grave accent, long
    .replaceAll(/([aeiouv]):/g, "$1²²") // long vowel with no diacritic
    .replaceAll(/([aeiouv])\u0301:/g, "$1³³") // combining acute accent, long
    .replaceAll(/([aeiouv])\u030C:/g, "$1²³") // combining caron accent, long
    .replaceAll(/([aeiouv])\u0302:/g, "$1³²") // combining circumflex accent, long
    .replaceAll(/([aeiouv])\u030B:/g, "$1⁴⁴") // combining double acute accent, long
    .replaceAll(/([aeiouv])\u030B/g, "$1⁴") // combining double acute accent, short (in cases where a final vowel is dropped and a highfall tone must become short)
    .replaceAll(/([aeiouv])\u0300/g, "$1¹") // combining grave accent, short
    .replaceAll(/([aeiouv])\u0301/g, "$1³") // combining acute accent, short
    .replaceAll(/([aeiouv])(?![¹²³⁴]|\W|$)/g, "$1²"); // vowel not followed by any tone yet
}

export function removeTonesAndMarkers(cherokee: string): string {
  return cherokee.replace(/[:\u0300-\u036f]/g, "");
}

export function simplifyPhonetics(cherokee: string): string {
  return removeTonesAndMarkers(normalizeAndRemovePunctuation(cherokee));
}
