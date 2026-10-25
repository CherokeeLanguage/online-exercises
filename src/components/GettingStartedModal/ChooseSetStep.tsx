import { ChangeEvent, FormEvent, ReactElement, useEffect , useState} from "react";
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
import { useUserStateContext } from "../../providers/UserStateProvider";
import { TermsByProficiencyLevelChart } from "../TermsByProficiencyLevelChart";

export const ChooseSetStep: Step = {  
  title: "Choose your first set",
  commitState: ({ collectionId }, {setUpstreamCollection}) => {
    if (collectionId !== undefined){
      setUpstreamCollection(collectionId);
    }
  },
  Component: ChooseStepComponent,
};

function ChooseStepComponent({
  wizardState: { collectionId, groupId },
  setWizardState,
  goToNextStep,
  goToPreviousStep,
}: StepProps): ReactElement {
  let canGoToNextStep = collectionId !== undefined; 
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
      canGoToNextStep = true; 
  }
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (collectionId && goToNextStep) goToNextStep();
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
        canGoToNextStep = true;
      }
    }
  }, [collectionId]);

  return (
    <div>

      <p></p>

      <form onSubmit={onSubmit}>
        <fieldset>
          <legend>Select a collection</legend>

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
          disabled = {!canGoToNextStep}
        />
      </form>
    </div>
  );
}
