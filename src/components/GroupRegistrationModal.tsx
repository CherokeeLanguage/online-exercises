import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import styled from "styled-components";
import { GROUPS, OPEN_BETA_ID } from "../state/reducers/groupId";
import { useUserStateContext } from "../providers/UserStateProvider";
import { Button } from "./Button";
import { Modal } from "./Modal";

const StyledFormSection = styled.div`
  margin: 32px;
  p {
    margin: 8px 0;
  }
`;

const StyledEmailInput = styled.input`
  :invalid {
    border-color: red;
  }
`;

export function GroupRegistrationModal() {
  const {
    config: { groupId: savedGroupId, userEmail: savedUserEmail },
    registerGroup,
    setUserEmail: saveUserEmail,
  } = useUserStateContext();
  const [groupId, setGroupId] = useState<string | null>(
    savedGroupId ?? OPEN_BETA_ID
  );
  const [userEmail, setUserEmail] = useState<string>(savedUserEmail ?? "");

  function onRadioChanged(e: ChangeEvent<HTMLInputElement>) {
    setGroupId(e.target.value);
  }

  function onEmailChanged(e: ChangeEvent<HTMLInputElement>) {
    setUserEmail(e.target.value);
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (groupId && userEmail) {
      registerGroup(groupId);
      saveUserEmail(userEmail);
    }
  }

  return (
    <Modal close={() => {}} title="Group registration">
      <p>We have a few questions to ask before you get started on the site.</p>
      <form onSubmit={onSubmit}>
        <StyledFormSection>
          <p>Are registering with any group that uses the app?</p>
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
        </StyledFormSection>
        <StyledFormSection>
          <p>
            We also need to be able contact you with important updates on the
            project.
          </p>
          <div style={{ display: "flex", gap: "8px" }}>
            <label htmlFor="userEmail">Email address:</label>
            <input
              type="email"
              id="userEmail"
              onChange={onEmailChanged}
              value={userEmail}
              placeholder="me@example.com"
              required
              style={{ flex: "1" }}
            />
          </div>
        </StyledFormSection>
        <p>
          Thank you so much! Please enjoy the website and contact a maintainer
          if you have any feedback.
        </p>
        <div style={{ textAlign: "center", margin: "8px 0" }}>
          <Button as={"input"} type="submit" value="Learn now!" />
        </div>
      </form>
    </Modal>
  );
}
