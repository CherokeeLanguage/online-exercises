import React, { ReactElement } from "react";
import {
  SimilarTermsAllSeenTerms,
  SimilarTermsForLesson,
} from "./exercises/SimilarTerms";
import {
  SimpleFlashcardsAllSeenTerms,
  SimpleFlashcardsForLesson,
} from "./exercises/SimpleFlashcards";
import { Lessons } from "./lessons";
import { Overview } from "./Overview";

type DelayedRoute = {
  element: () => ReactElement;
  path?: string;
  name: string;
  index?: boolean;
};

export const routes: DelayedRoute[] = [
  {
    name: "Similar terms",
    path: "similar-terms/:lessonName/:cumulative",
    element: () => <SimilarTermsForLesson />,
  },
  {
    name: "Similar terms",
    path: "similar-terms/",
    element: () => <SimilarTermsAllSeenTerms />,
  },
  {
    name: "Flashcards",
    path: "flashcards/:lessonName/:cumulative",
    element: () => <SimpleFlashcardsForLesson />,
  },
  {
    name: "Flashcards",
    path: "flashcards/",
    element: () => <SimpleFlashcardsAllSeenTerms />,
  },
  {
    name: "Lessons",
    index: true,
    element: () => <Lessons />,
  },
  {
    name: "Overview",
    path: "overview/",
    element: () => <Overview />,
  },
];
