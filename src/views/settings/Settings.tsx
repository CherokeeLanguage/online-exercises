import { ChangeEvent, useId, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Button } from "../../components/Button";
import { SectionHeading } from "../../components/SectionHeading";
import { lessonKey } from "../../state/reducers/lessons";
import {
  isPhoneticsPreference,
  PREFERENCE_LITERATES,
} from "../../state/reducers/phoneticsPreference";
import { UserState, useUserStateContext } from "../../state/UserStateProvider";

interface ExportedLessonData {
  lessonId: string;
  reviewedTerms: string | null;
  timings: string | null;
}

export function Settings() {
  return (
    <div>
      <Preferences />
      <br />
      <hr />
      <p>
        <em>
          Settings below this point might not be much use to you unless a
          maintainer of this website contacted you.
        </em>
      </p>
      <ImportExportDataConsole />
    </div>
  );
}

const PreferencesForm = styled.form`
  display: grid;
  grid-template-columns: auto 1fr;
  grid-gap: 8px;
`;

function Preferences() {
  const { setPhoneticsPreference, phoneticsPreference } = useUserStateContext();
  const phoneticsPreferenceId = useId();

  function onPhoneticsPreferenceChanged(event: ChangeEvent<HTMLSelectElement>) {
    event.preventDefault();
    const newPreference = event.target.value;
    if (isPhoneticsPreference(newPreference)) {
      setPhoneticsPreference(newPreference);
    }
  }

  return (
    <div>
      <SectionHeading>Preferences</SectionHeading>
      <PreferencesForm>
        <label htmlFor={phoneticsPreferenceId}>Phonetics preference</label>
        <select
          id={phoneticsPreferenceId}
          value={phoneticsPreference}
          onChange={onPhoneticsPreferenceChanged}
        >
          {Object.entries(PREFERENCE_LITERATES).map(([value, literate], i) => (
            <option key={i} value={value}>
              {literate}
            </option>
          ))}
        </select>
      </PreferencesForm>
    </div>
  );
}

function ImportExportDataConsole() {
  const userState = useUserStateContext();
  const [fileToLoad, setFileToLoad] = useState<File | null>(null);
  const navigate = useNavigate();

  function downloadAllData() {
    // this will need to be updated as data is added to user state.  if you get
    // a type error here, you probably added a new top level field to user
    // state, and need to add that key here.
    const fieldsToSave: Record<keyof UserState, null> = {
      leitnerBoxes: null,
      lessonCreationError: null,
      lessons: null,
      sets: null,
      upstreamCollection: null,
      groupId: null,
      phoneticsPreference: null,
    };

    const stateToSave = Object.keys(fieldsToSave).reduce(
      (obj, key) => ({ ...obj, [key]: userState[key as keyof UserState] }),
      {}
    );

    const lessonData: ExportedLessonData[] = Object.keys(userState.lessons).map(
      (lessonId) => ({
        lessonId,
        reviewedTerms: window.localStorage.getItem(
          lessonKey(lessonId) + "/reviewed-terms"
        ),
        timings: window.localStorage.getItem(lessonKey(lessonId) + "/timings"),
      })
    );

    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify({ ...stateToSave, lessonData }));
    const dlAnchorElem = document.createElement("a");

    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "cherokeeLanguageExercisesData.json");

    dlAnchorElem.click();
  }

  function onLoadFileChanged(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length !== 1) {
      setFileToLoad(null);
    } else {
      setFileToLoad(files[0]);
    }
  }

  function loadData() {
    if (fileToLoad)
      fileToLoad.text().then((data) => {
        const { lessonData, ...state } = JSON.parse(data);
        // load lesson data
        lessonData.forEach((exported: ExportedLessonData) => {
          if (exported.reviewedTerms) {
            window.localStorage.setItem(
              lessonKey(exported.lessonId) + "/reviewed-terms",
              exported.reviewedTerms
            );
          }

          if (exported.timings) {
            window.localStorage.setItem(
              lessonKey(exported.lessonId) + "/timings",
              exported.timings
            );
          }
        });

        // load larger user state
        userState.loadState(state);
        navigate("/");
      });
  }
  return (
    <div>
      <SectionHeading>Export data</SectionHeading>
      <Button onClick={downloadAllData}>Download all data</Button>
      <br />
      <br />
      <SectionHeading>Import data</SectionHeading>
      <form onSubmit={loadData}>
        <label htmlFor="loadDataFile">Select a file to load data from</label>
        <input name="loadDataFile" type="file" onChange={onLoadFileChanged} />
        <Button role="submit">Load data</Button>
      </form>
    </div>
  );
}
