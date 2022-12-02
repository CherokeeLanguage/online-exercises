import { UserStateAction } from "../actions";
import { UserState } from "../UserStateProvider";
import { GroupId } from "./groupId";

export enum PhoneticsPreference {
  NoPhonetics = "NO_PHONETICS",
  Simple = "SIMPLE",
  Detailed = "DETAILED",
}

export const PREFERENCE_LITERATES: Record<PhoneticsPreference, string> = {
  NO_PHONETICS: "Do not show phonetics if syllabary is shown.",
  SIMPLE: "Show phonetics broken up by syllable. Eg. 'A-hyv-da-gwa-lo-s-gi'",
  DETAILED:
    "Show rich phonetics that show vowel length and tone. Eg. 'Ahyv:dagwalò:sgi'",
};

export function isPhoneticsPreference(str: string): str is PhoneticsPreference {
  // we can't do "hasOwn" on PhoneticsPreference because it also contains
  // reverse mapping ("NO_PHONETICS": "NoPhonetics")
  return Object.hasOwn(PREFERENCE_LITERATES, str);
}

export function reducePhoneticsPreference(
  state: UserState,
  action: UserStateAction
): PhoneticsPreference | undefined {
  if (action.type === "SET_PHONETICS_PREFERENCE") return action.newPreference;
  else return state.phoneticsPreference;
}
