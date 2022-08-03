import React, { ReactElement } from "react";
import { RouteProps } from "react-router-dom";
import {
  SimilarTerms,
  SimilarTermsAllSeenTerms,
  SimilarTermsForLesson,
} from "./exercises/SimilarTerms";
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
