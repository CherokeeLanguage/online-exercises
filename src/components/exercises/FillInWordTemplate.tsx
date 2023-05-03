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
import {
  pickNRandom,
  pickRandomElement,
  spliceInAtRandomIndex,
  getSimilarTerms,
  wordsInTerm,
  wordsInLesson,
  getSimilarWords,
} from "./utils";
import { Button } from "../Button";
import { Card } from "../../data/cards";
import { TermCardWithStats, TermStats } from "../../spaced-repetition/types";

export function pickRandomIndex<T>(options: T[]): number {
  return Math.floor(Math.random() * options.length);
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
  syllabary: string[],
  cherokee: string[],
  hideWordIdx: number
): [string[][], string[]] {
  const maskedSyllabary = syllabary.map((word, idx) =>
    idx === hideWordIdx ? "_".repeat(5) : word
  );

  const maskedCherokee = cherokee.map((word, idx) =>
    idx === hideWordIdx ? "_".repeat(5) : word
  );

  return [
    [maskedSyllabary, maskedCherokee],
    [syllabary[hideWordIdx], cherokee[hideWordIdx]],
  ];
}

function chooseTermRecurs(term: string[], wordIdx: number): string {
  if (wordIdx < 0) {
    return "";
  } else if (term.length <= wordIdx && term[wordIdx].length > 0) {
    return term[wordIdx];
  } else {
    return chooseTermRecurs(term, wordIdx - 1);
  }
}

function chooseTerm(term: string[][], wordIdx: number): string[] {
  return [term[0][term.length - 1], term[1][term.length - 1]];
  if (term.length <= wordIdx && term[wordIdx].length > 0) {
    return term[wordIdx];
  } else {
    return term[term.length - 1];
  }
}

export function RandomWords(
  currentCard: TermCardWithStats<Card, TermStats>,
  lessonCards: Record<string, Card>,
  wordIdx: number
): string[][] {
  // return a list of of other possible words
  // that are not the masked word

  const terms = getSimilarTerms(currentCard, lessonCards, 4).map(
    (word, idx) => [word.syllabary.split(" "), word.cherokee.split(" ")]
  );
  return terms.map((term, idx) => chooseTerm(term, wordIdx));
}

function ToQuestion(
  maskedSyllabary: string[],
  maskedCherokee: string[],
  maskInt: number
): ReactElement {
  // create a question elements from a list of masked words
  return (
    <div>
      <p>
        {maskedSyllabary.map((word, idx) => (
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
      </p>

      <p>
        {maskedCherokee.map((word, idx) => (
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
      </p>
    </div>
  );
}
function CanUseQuestion(card: TermCardWithStats<Card, TermStats>) {
  return wordsInTerm(card.card)[0].length > 1;
}
function ToOptions(words: string[][]): ReactElement[] {
  // create an array of react elements from possible words
  return words.map((word, idx) => (
    <div>
      {" "}
      <p> {word[0]}</p> <p> {word[1]}</p>{" "}
    </div>
  ));
}

interface FeedbackProps {
  currentCard: Card;
  options: ReactElement[];
  correctIdx: number;
}

function Feedback({
  currentCard,
  options,
  correctIdx,
}: FeedbackProps): ReactElement {
  const { selectedAnswer, endFeedback } = useAnswersWithFeedback();
  return (
    <div>
      <p>
        Correct answer: <strong>{options[correctIdx]}</strong>
      </p>

      <p>
        Full Cheorkee: <span> {currentCard.cherokee}</span>
      </p>

      <p>
        Full English: <span> {currentCard.english}</span>
      </p>

      <Button onClick={endFeedback}>Continue</Button>
    </div>
  );
}

interface QuestionProps {
  question: ReactElement;
  options: ReactElement[];
  correctIdx: number;
  AnswerFeedback: (props: FeedbackProps) => ReactElement;
}

function CreateFillInWordQuestion({
  currentCard,
  lessonCards,
}: ExerciseComponentProps): QuestionProps {
  // create a list of words in the term
  const words = useMemo(() => wordsInTerm(currentCard.card), [currentCard]);

  // randomly choose word to mask
  const hiddenIdx = pickRandomIndex(words[0]);

  //get words in lesson
  const lessonWords = useMemo(() => wordsInLesson(lessonCards), [lessonCards]);

  // randomly choose other words as options
  const otherWords = useMemo(
    () =>
      getSimilarWords(
        [words[0][hiddenIdx], words[1][hiddenIdx]],
        lessonWords,
        4
      ),
    [words]
  );

  // turn question and options into react elements
  const maskedWords = useMemo(
    () => maskWords(words[0], words[1], hiddenIdx),
    [words]
  );
  const question = useMemo(
    () => ToQuestion(maskedWords[0][0], maskedWords[0][1], hiddenIdx),
    [maskedWords]
  );

  const [correctIdx, allOptions] = useMemo(
    () => spliceInAtRandomIndex(otherWords, maskedWords[1]),
    [otherWords, maskedWords]
  );

  const options = useMemo(() => ToOptions(allOptions), [allOptions]);

  // create props objects

  const props: QuestionProps = {
    question: question,
    options: options,
    correctIdx: correctIdx,
    AnswerFeedback: Feedback,
  };
  return props;
}

interface FillInTheBlankProps extends ExerciseComponentProps {
  canUseQuestion: (card: TermCardWithStats<Card, TermStats>) => boolean;
  createQuestion: (props: ExerciseComponentProps) => QuestionProps;
  playAudio: boolean;
  instructions: String;
}

export function FillInTheBlank({
  canUseQuestion,
  createQuestion,
  playAudio,
  instructions,
  ...props
}: FillInTheBlankProps): ReactElement {
  const { question, options, correctIdx, AnswerFeedback } =
    createQuestion(props);

  // pick random voice to use
  const cherokeeAudio = useMemo(
    () => pickRandomElement(props.currentCard.card.cherokee_audio),
    [props.currentCard]
  );
  const { play, playing } = useAudio({
    src: cherokeeAudio,
    autoplay: true,
  });

  useEffect(() => {
    if (!canUseQuestion(props.currentCard)) props.reviewCurrentCard(true);
  }, [question]);

  return (
    <ContentWrapper style={{ fontSize: "1.5em" }}>
      <div style={{ maxWidth: "800px", margin: "auto" }}>
        <p>{instructions}</p>
        <div style={{ fontSize: 24 }}>{question}</div>
        <div style={{ fontSize: "0.75em" }}>
          <ListenAgainButton playAudio={play} playing={playing} />
        </div>
        <AnswersWithFeedback
          reviewCurrentCard={props.reviewCurrentCard}
          hintLocation={"overAnswers"}
          IncorrectAnswerHint={() => (
            <AnswerFeedback
              currentCard={props.currentCard.card}
              options={options}
              correctIdx={correctIdx}
            />
          )}
        >
          {options.map((option, idx) => (
            <AnswerCard correct={idx === correctIdx} idx={idx} key={idx}>
              <span style={{ fontSize: 24 }}>{option}</span>
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

export function FillIntheWord(exercise: ExerciseComponentProps) {
  const props: FillInTheBlankProps = {
    canUseQuestion: CanUseQuestion,
    createQuestion: CreateFillInWordQuestion,
    playAudio: true,
    instructions: "Choose the correct word",
    ...exercise,
  };

  return FillInTheBlank(props);
}
