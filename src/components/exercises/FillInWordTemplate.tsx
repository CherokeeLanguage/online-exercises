import React, { ReactElement, useEffect, useMemo } from "react";
import styled from "styled-components";
import { PhoneticsPreference } from "../../state/reducers/phoneticsPreference";
import { theme } from "../../theme";
import {
  alignSyllabaryAndPhonetics,
  getPhonetics,
} from "../../utils/phonetics";
import { useAudio } from "../../utils/useAudio";
import {
  AnswerCard,
  AnswersWithFeedback,
  useAnswersWithFeedback,
} from "../AnswersWithFeedback";
import { Loader } from "../Loader";
import { ExerciseComponentProps } from "./Exercise";
import { FlagIssueButton } from "../FlagIssueModal";
import { ListenAgainButton } from "../ListenAgainButton";
import { ContentWrapper } from "./ContentWrapper";
import { pickNRandom, pickRandomElement, spliceInAtRandomIndex, getSimilarTerms } from "./utils";
import { Button } from "../Button";
import { Card } from "../../data/cards";
import { TermCardWithStats, TermStats } from "../../spaced-repetition/types";

export function pickRandomIndex<T>(options: T[]) : number {
  return Math.floor(Math.random() * options.length);
}



export function wordsInTerm(
  card: Card 
): string[] {
  return card.syllabary.split(" "); 
}
// maybe change
const MaskedWord = styled.mark`
  /* text-decoration: underline;
  text-decoration-thickness: 8; */
  font-weight: bold;
  background-color: ${theme.colors.WHITE};
  color: ${theme.colors.DARK_RED};
  border-bottom: 8px solid ${theme.colors.DARK_RED};
  display: inline-block;
`;



export function maskWords(
  words: string[],
  hideWordIdx: number
): [string[], string] {
    return [words.map((word, idx) =>
    idx === hideWordIdx ? "_".repeat(word.length) : word
  ),
  words[hideWordIdx] ,
  ];
}

export function RandomWords(currentCard: TermCardWithStats<Card, TermStats>, lessonCards: Record<string, Card>,): string[]{
    // return a list of of other possible words 
    // that are not the masked word 

    return getSimilarTerms(currentCard, lessonCards, 3).map((word, idx) => word.syllabary);
}

function ToQuestion(maskedWords: string[], maskInt: number): ReactElement{
  // create a question elements from a list of masked words 
  return (<p>
    {maskedWords.map((word, idx) => (
      <>
        {idx > 0 && " "}
        {idx === maskInt ? (
          <span>
            <MaskedWord>
            <sup> {"?".repeat(word.length)} </sup>
            </MaskedWord>
           
          </span>
        ) : (
          <span>{word}</span>
        )}
      </>
    ))}
  </p>); 
}
function CanUseQuestion(card :TermCardWithStats<Card, TermStats> ){
  return wordsInTerm(card.card).length > ; 
}
function ToOptions(words: string[]): ReactElement[]{
  // create an array of react elements from possible words 
  return words.map((word, idx) => (<span>{word}</span>)); 
}

function Feedback(){
  const { selectedAnswer, endFeedback } = useAnswersWithFeedback();
  return (<div>
    <p>
    You were wrong 
    </p>
    
    <Button onClick={endFeedback}>Continue</Button>
  </div>) 
}


function CreateFillInWordQuestion({
  currentCard,
  lessonCards,
}: ExerciseComponentProps): [ ReactElement,  ReactElement[],  number,  any ]{
  // create a list of words in the term 
  const words = wordsInTerm(currentCard.card); 

  // randomly choose word to mask 
  const hiddenIdx = pickRandomIndex(words); 

  // randomly choose other words as options 
  const otherWords = useMemo(
    () => RandomWords(currentCard, lessonCards),
    [currentCard]
  );

  // turn question and options into react elements 
  const maskedWords = maskWords(words, hiddenIdx); 
  const question = ToQuestion(maskedWords[0], hiddenIdx); 

  
  const [correctIdx, allOptions] = spliceInAtRandomIndex(
    otherWords,
    maskedWords[1]
  );

  const options = ToOptions(allOptions); 

  // create an answerfeedback elements 

  return [question, options, correctIdx, Feedback]; 
}

export function FillInTheBlank( props: ExerciseComponentProps, 
   canUseQuestion: (arg0: TermCardWithStats<Card, TermStats>) => boolean, createQuestion: (arg0: ExerciseComponentProps) => [ ReactElement,  ReactElement[],  number,  any ], 
   playAudio: boolean, instructions: String): ReactElement {
  
    
  
    const contents = useMemo(() => createQuestion(props), [props.currentCard]); 
    const question = contents[0]; 
    const options = contents[1]; 
    const correctIdx = contents[2]; 
    const answerFeedback = contents[3]; 

  
  // pick random voice to use
  const cherokeeAudio = useMemo(
    () => pickRandomElement(props.currentCard.card.cherokee_audio),
    [props.currentCard]
  );
  const { play, playing } = useAudio({
    src: cherokeeAudio,
    autoplay: true,
  });
  
    /*useEffect(() => {
      if (!canUseQuestion(props.currentCard)) props.reviewCurrentCard(true);
    }, [question]);*/ 

    useEffect(() => {
      if (false) props.reviewCurrentCard(true);
    }, [question]);
  
    
    return (
      <ContentWrapper style={{ fontSize: "1.5em" }}>
      <div style={{ maxWidth: "800px", margin: "auto" }}>
        <p>
          {instructions}
        </p>
        <div style={{ fontSize: 24 }}>
          {question}  
          </div>
          <div style={{ fontSize: "0.75em" }}>
          <ListenAgainButton playAudio={play} playing={playing} />
        </div>
          <AnswersWithFeedback
            reviewCurrentCard={props.reviewCurrentCard}
            hintLocation={"overAnswers"}
            IncorrectAnswerHint = {() => answerFeedback()}
          >
            {options.map((option, idx) => (
              <AnswerCard correct={idx === correctIdx} idx={idx} key={idx}>
                <span style={{ fontSize: 24 }}>
                  {option}
                </span>
              </AnswerCard>
            ))}
          </AnswersWithFeedback>
          
          <FlagIssueButton
          problematicAudio={cherokeeAudio}
          card={props.currentCard.card}
        />
        </div>
        </ContentWrapper>
    );

  

  
}

function CreateFeedback({feedbackFunction} :{feedbackFunction : () => ReactElement}): ReactElement{
  return feedbackFunction(); 
}

export function FillIntheWord(exercise: ExerciseComponentProps){
  return(FillInTheBlank(exercise, CanUseQuestion, CreateFillInWordQuestion, true, "Choose the correct word"));
}


