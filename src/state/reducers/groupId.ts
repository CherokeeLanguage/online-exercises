import { SEE_SAY_WRITE_COLLECTION } from "../../data/vocabSets";
import { UserStateAction } from "../actions";
import { UserState } from "../UserStateProvider";
import { PhoneticsPreference } from "./phoneticsPreference";

export interface Group {
  name: string;
  defaultCollectionId?: string;
  phoneticsPreference?: PhoneticsPreference;
}

export const OPEN_BETA_ID = "03e2ec2d-4877-48d7-96c1-c74a907c65ae";

const __groups = {
  "3f1089ca-57c5-4d85-ba44-289b896c0f6e": {
    name: "Cherokee Community of Puget Sound Beginners Group",
    defaultCollectionId: SEE_SAY_WRITE_COLLECTION,
    phoneticsPreference: PhoneticsPreference.Simple,
  },
  [OPEN_BETA_ID]: {
    name: "Other / not affiliated",
  },
} as const;

export const GROUPS = __groups as typeof __groups extends Record<infer K, Group>
  ? Record<K, Group>
  : never;

export type GroupId = keyof typeof GROUPS;

export function isGroupId(id: string): id is GroupId {
  return Object.hasOwn(GROUPS, id);
}

export function reduceGroupId(
  state: UserState,
  action: UserStateAction
): GroupId | null {
  if (action.type === "REGISTER_GROUP_AND_APPLY_DEFAULTS")
    return action.groupId;
  else return state.config.groupId;
}
