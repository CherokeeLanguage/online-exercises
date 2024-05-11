import { SimilarTerms } from "../../components/exercises/SimilarTerms";
import { SimpleFlashcards } from "../../components/exercises/SimpleFlashcards";
import { FillInTheTone } from "../../components/exercises/FillInTheTone";
import { CombinedLesson } from "../../components/exercises/CombinedLesson";
import { ExerciseComponentProps } from "./Exercise";
import { ReactElement } from "react";

interface ExerciseInfo {
  path: string;
  name: string;
  description: string;
  Component: (props: ExerciseComponentProps) => ReactElement;
  // set to true if game is a minigame that does not require the user to have vocab
  minigame?: boolean;
}

export const CombinedLessonInfo: ExerciseInfo = {
  path: "combined-lesson",
  name: "Combined lesson",
  description:
    "Practice with a mix of flashcards, multiple choice, listening exercises, and more!",
  Component: CombinedLesson,
};

export const FlashcardsInfo: ExerciseInfo = {
  path: "flashcards",
  name: "Flashcards",
  description:
    "Practice terms by reviewing them as flashcards with Cherokee and English audio. Takes about 10-20 minutes.",
  Component: SimpleFlashcards,
};

export const SimilarTermsInfo: ExerciseInfo = {
  path: "similar-terms",
  name: "Similar terms",
  description:
    "Practice terms by listening to Cherokee audio and choosing between similar sounding answers. Often takes less time than flashcards, but often leads to more mistakes.",
  Component: SimilarTerms,
};

export const FillInTheToneInfo: ExerciseInfo = {
  path: "fill-in-the-tone",
  name: "Fill in the tone",
  description:
    "Practice your tone accuracy by filling in the tone sequence for the missing word in the term.",
  Component: FillInTheTone,
  minigame: true,
};

export const exercises: ExerciseInfo[] = [
  CombinedLessonInfo,
  FlashcardsInfo,
  SimilarTermsInfo,
  FillInTheToneInfo,
];
