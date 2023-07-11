import {
  ChangeEvent,
  FormEvent,
  ReactElement,
  useContext,
  useEffect,
  useState,
} from "react";
import { Button } from "../../components/Button";
import {
  isPhoneticsPreference,
  PhoneticsPreference,
  PREFERENCE_LITERATES,
} from "../../state/reducers/phoneticsPreference";
import { GROUPS, isGroupId } from "../../state/reducers/groupId";
import { SectionHeading } from "../../components/SectionHeading";
import { CollectionDetails } from "../../components/CollectionDetails";

import { collections, VocabSet } from "../../data/vocabSets";
import { useUserStateContext } from "../../providers/UserStateProvider";
import { TermsByProficiencyLevelChart } from "../../components/TermsByProficiencyLevelChart";
import { Step, wizardContext } from "./SetupWizard";

export const PickCourseStep: Step = {
  name: "Pick course",
  Component: PickCourse,
};

function PickCourse(): ReactElement {
  const { finishPickCourse } = useContext(wizardContext);
  const [collectionId, setCollectionId] = useState<string>();
  let canGoToNextStep = collectionId !== undefined;

  function onRadioChanged(e: ChangeEvent<HTMLInputElement>) {
    const collectionId = e.target.value;
    setCollectionId(collectionId);
  }
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (collectionId) finishPickCourse({ collectionId });
  }

  function totalTerms(vocab: VocabSet[]) {
    var t = 0;

    vocab.map((vocabSet) => (t += vocabSet.terms.length));

    return t;
  }

  return (
    <div>
      <form onSubmit={onSubmit}>
        <fieldset>
          <legend>Select a collection</legend>

          {Object.values(collections).map((collection, idx) => (
            <div key={idx}>
              <input
                name={collection.title}
                type="radio"
                value={collection.id}
                id={collection.id}
                onChange={onRadioChanged}
                checked={collectionId == collection.id}
              />
              <label htmlFor={collection.id}>
                {collection.title} ({totalTerms(collection.sets)} terms){" "}
              </label>
            </div>
          ))}
        </fieldset>
        {/* <NavigationButtons
          goToPreviousStep={goToPreviousStep}
          goToNextStep={goToNextStep}
          disabled={!canGoToNextStep}
        /> */}
      </form>
    </div>
  );
}
