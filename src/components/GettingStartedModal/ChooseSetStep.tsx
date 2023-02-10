import { ChangeEvent, FormEvent, ReactElement, useEffect } from "react";
import { NavigationButtons, Step, StepProps } from ".";
import { Button } from "../Button";
import {
  isPhoneticsPreference,
  PhoneticsPreference,
  PREFERENCE_LITERATES,
} from "../../state/reducers/phoneticsPreference";
import { GROUPS, isGroupId } from "../../state/reducers/groupId";
import { SectionHeading } from "../SectionHeading";
import { CollectionDetails } from "../CollectionDetails";

import { collections, VocabSet } from "../../data/vocabSets"; 
import { useUserStateContext } from "../../state/UserStateProvider";
import { TermsByProficiencyLevelChart } from "../TermsByProficiencyLevelChart";

export const ChooseSetStep: Step = {

  
  title: "Phonetics",
  commitState: ({ collectionId }, {setUpstreamCollection}) => {
    setUpstreamCollection(collectionId);
  },
  Component: PhoneticsStepComponent,
};

function PhoneticsStepComponent({
  wizardState: { collectionId, groupId },
  setWizardState,
  goToNextStep,
  goToPreviousStep,
}: StepProps): ReactElement {
  function setWizardStateCollectionId(
    newCollectionId: string
  ) {
    setWizardState((s) => ({
      ...s,
      collectionId: newCollectionId,
    }));
  }
  function onRadioChanged(e: ChangeEvent<HTMLInputElement>) {
    const collectionId  = e.target.value;
      setWizardStateCollectionId(collectionId);
  }
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (collectionId) goToNextStep();
  }


  function totalTerms(vocab: VocabSet[]){
    var t = 0; 

    vocab.map((vocabSet) => (
      t += vocabSet.terms.length
    ))

    return t; 
  } 



  useEffect(() => {
    if (!collectionId) {
      const defaultCollectionId =
        groupId && isGroupId(groupId)
          ? GROUPS[groupId].defaultCollectionId
          : undefined;
      if (defaultCollectionId) {
        setWizardStateCollectionId(defaultCollectionId)
      }
    }
  }, [collectionId]);

  return (
    <div>

      <p>Choose your first set</p>

      <form onSubmit={onSubmit}>
        <fieldset>
          <legend>Choose your collection</legend>

          {Object.values(collections).map((collection, idx) => (
            <div key={idx}>

            <input 
              name = {collection.title}
              type = "radio"
              value = {collection.id} 
              id = {collection.id} 
              onChange = {onRadioChanged}
              checked = {collectionId == collection.id}
            />
            <label htmlFor={collection.id}>{collection.title} ({totalTerms(collection.sets)} terms) </label>

            </div>
            
      ))}

        </fieldset>
        <NavigationButtons
          goToPreviousStep={goToPreviousStep}
          goToNextStep={goToNextStep}
          customNext={<Button as={"input"} type="submit" value="Next" />}
        />
      </form>
    </div>
  );
}
