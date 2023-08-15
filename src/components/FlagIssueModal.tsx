import { FormEvent, useMemo, useState } from "react";
import { v4 } from "uuid";
import { Card } from "../data/cards";
import { useAuth } from "../firebase/AuthProvider";
import { issueReportPath, setTyped } from "../firebase/paths";
import { useUserStateContext } from "../providers/UserStateProvider";
import { PhoneticsPreference } from "../state/reducers/phoneticsPreference";
import { getPhonetics } from "../utils/phonetics";
import { Button } from "./Button";
import { Modal } from "./Modal";

export function FlagIssueModal({
  card,
  problematicAudio,
  close,
}: {
  card: Card;
  problematicAudio?: string;
  close: () => void;
}) {
  const {
    config: { userEmail },
  } = useUserStateContext();
  const { user } = useAuth();
  const issueId = useMemo(() => v4(), []);
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  function saveIssueAndClose(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setTyped(issueReportPath(issueId), {
      card,
      userEmail: userEmail ?? "Not set",
      userId: user.uid,
      problematicAudio,
      description,
      createdAt: Date.now(),
    }).then(() => {
      setSaving(false);
      close();
    });
  }
  return (
    <Modal title={"Flag issue"} close={close}>
      <div style={{ minWidth: "calc(min(400px, 100%))" }}>
        <h4>Term information</h4>
        <ul>
          <li>
            <strong>Syllabary:</strong> {card.syllabary}
          </li>
          <li>
            <strong>Simple phonetics:</strong>{" "}
            {getPhonetics(card, PhoneticsPreference.Simple)}
          </li>
          <li>
            <strong>Detailed phonetics:</strong>{" "}
            {getPhonetics(card, PhoneticsPreference.Detailed)}
          </li>
          <li>
            <strong>English translation:</strong> {card.english}
          </li>
        </ul>
      </div>
      <div>
        <form onSubmit={(e) => saveIssueAndClose(e)}>
          <div style={{ display: "flex" }}>
            <label>Please describe the issue:</label>
          </div>

          <div style={{ display: "flex", padding: "8px" }}>
            {" "}
            <textarea
              style={{
                flex: "1",
                borderRadius: "20px",
                padding: "10px",
                outline: "none",
                border: "1px solid black",
              }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={saving}
              placeholder="Audio doesn't match, tone is incorrect, etc."
            />
          </div>
          <Button
            as="input"
            type="submit"
            value={saving ? "Saving..." : "Submit issue"}
            disabled={saving}
            style={{ float: "right" }}
          />
        </form>
      </div>
    </Modal>
  );
}

export function FlagIssueButton({
  card,
  problematicAudio,
  style,
}: {
  card: Card;
  problematicAudio?: string;
  style?: React.CSSProperties;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <>
      {modalOpen && (
        <FlagIssueModal
          card={card}
          problematicAudio={problematicAudio}
          close={() => setModalOpen(false)}
        />
      )}
      <Button
        variant={"negative"}
        onClick={() => setModalOpen(true)}
        style={{ marginTop: 24, ...style }}
      >
        Flag issue
      </Button>
    </>
  );
}
