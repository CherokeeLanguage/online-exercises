import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { GROUPS, OPEN_BETA_ID } from "../state/reducers/groupId";
import { useUserStateContext } from "../state/UserStateProvider";
import { Button } from "./Button";
import { Modal } from "./Modal";

export function GroupRegistrationModal({
  registerGroup,
}: {
  registerGroup: (id: string) => void;
}) {
  const {
    config: { groupId: savedGroupId },
  } = useUserStateContext();
  const [groupId, setGroupId] = useState<string | null>(null);
  useEffect(() => setGroupId(savedGroupId ?? OPEN_BETA_ID), [savedGroupId]);

  function onRadioChanged(e: ChangeEvent<HTMLInputElement>) {
    setGroupId(e.target.value);
  }
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (groupId) registerGroup(groupId);
  }

  return (
    <Modal close={() => {}} title="Group registration">
      <p>We have a few questions to ask before you get started on the site.</p>
      <form onSubmit={onSubmit}>
        <p>First, are registering with any group that uses the app?</p>
        <fieldset>
          <legend>Group</legend>
          {Object.entries(GROUPS).map(([id, group]) => (
            <div key={id}>
              <input
                type="radio"
                name="groupId"
                checked={id === groupId}
                value={id}
                id={id}
                onChange={onRadioChanged}
              />
              <label htmlFor={id}>{group.name}</label>
            </div>
          ))}
        </fieldset>
        <div style={{ textAlign: "center", marginTop: "8px" }}>
          <Button as={"input"} type="submit" value="Register!" />
        </div>
      </form>
    </Modal>
  );
}
