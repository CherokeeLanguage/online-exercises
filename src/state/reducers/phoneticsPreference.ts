export enum PhoneticsPreference {
  NoPhonetics = "NO_PHONETICS",
  Simple = "SIMPLE",
  Detailed = "DETAILED",
}

export const PREFERENCE_LITERATES: Record<PhoneticsPreference, string> = {
  NO_PHONETICS: "Do not show phonetics if syllabary is shown.",
  SIMPLE: "Show phonetics without tone or vowel length. Eg. 'Ahyvdagwalosgi'",
  DETAILED:
    "Show rich phonetics that show vowel length and tone. Eg. 'Ahyv:dagwalò:sgi'",
};

export function isPhoneticsPreference(str: string): str is PhoneticsPreference {
  // we can't do "hasOwn" on PhoneticsPreference because it also contains
  // reverse mapping ("NO_PHONETICS": "NoPhonetics")
  return Object.hasOwn(PREFERENCE_LITERATES, str);
}
