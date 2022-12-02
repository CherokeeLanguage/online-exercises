import { Card } from "../data/cards";
import { PhoneticsPreference } from "../state/reducers/phoneticsPreference";

export function getPhonetics(
  card: Card,
  phoneticsPreference: PhoneticsPreference | undefined
): string {
  return getRawPhonetics(card, phoneticsPreference).normalize("NFKC");
}

function getRawPhonetics(
  card: Card,
  phoneticsPreference: PhoneticsPreference | undefined
): string {
  switch (phoneticsPreference) {
    case PhoneticsPreference.Detailed:
      return normalizeAndRemovePunctuation(card.cherokee);
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
    .replaceAll(/[\.\?]/g, "")
    .normalize("NFKD");
}

export function removeTonesAndMarkers(cherokee: string): string {
  return cherokee.replace(/[\:ɂ\u0300-\u036f]/g, "");
}

export function simplifyPhonetics(cherokee: string): string {
  return removeTonesAndMarkers(normalizeAndRemovePunctuation(cherokee));
}
