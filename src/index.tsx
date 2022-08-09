import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { LeitnerBoxProvider } from "./spaced-repetition/LeitnerBoxProvider";
import { BrowseSets } from "./views/sets/BrowseSets";
import { ViewSet } from "./views/sets/ViewSet";
// import { Overview } from "./Overview";
import { PracticeLesson } from "./Practice";
import { Dashboard } from "./views/Dashboard";
import { BrowseLessons } from "./views/lessons/BrowseLessons";
import { ViewLesson } from "./views/lessons/ViewLesson";
import { LessonsProvider } from "./spaced-repetition/LessonsProvider";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <HashRouter>
      <LeitnerBoxProvider
        numBoxes={6}
        localStorageKey="global-leitner-boxes-v2"
      >
        <LessonsProvider>
          <Routes>
            <Route path="/" element={<App />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="sets">
                <Route index element={<BrowseSets />} />
                <Route path=":setId" element={<ViewSet />} />
              </Route>
              <Route path="lessons">
                <Route index element={<BrowseLessons />} />
                <Route path=":lessonId" element={<ViewLesson />} />
              </Route>
              <Route path="practice">
                <Route index element={<Navigate to="/lessons/" replace />} />
                <Route path=":lessonId/*" element={<PracticeLesson />}></Route>
              </Route>
            </Route>
          </Routes>
        </LessonsProvider>
      </LeitnerBoxProvider>
    </HashRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
