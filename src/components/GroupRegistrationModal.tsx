import React, { ChangeEvent, FormEvent, useState } from "react";
import { GROUPS } from "../state/reducers/groupId";
import { Button } from "./Button";
import { Modal } from "./Modal";

export function GroupRegistrationModal({
  registerGroup,
}: {
  registerGroup: (id: string) => void;
}) {
  const [groupId, setGroupId] = useState<string | undefined>(undefined);
  function onRadioChanged(e: ChangeEvent<HTMLInputElement>) {
    setGroupId(e.target.value);
  }
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (groupId) registerGroup(groupId);
  }
  return (
    <Modal close={() => {}} title="Group registration">
      <p>
        Please select the group you are registered with to use the app. If you
        are not part of any group, please choose the "Open beta" option.
      </p>
      <form onSubmit={onSubmit}>
        <fieldset>
          <legend>Group</legend>
          {Object.entries(GROUPS).map(([id, group]) => (
            <div key={id}>
              <input
                type="radio"
                name="groupId"
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
