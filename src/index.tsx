import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import App from "./App";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { BrowseSets } from "./views/sets/BrowseSets";
import { MySets } from "./views/sets/MySets";
import { ViewSet } from "./views/sets/ViewSet";
// import { Overview } from "./Overview";
import { UserStateProvider } from "./state/UserStateProvider";
import { Dashboard } from "./views/dashboard/Dashboard";
import { LessonArchive } from "./views/lessons/LessonArchive";
import { ViewLesson } from "./views/lessons/ViewLesson";
import { PracticeLesson } from "./views/practice/PracticeLesson";
import { NewLesson } from "./views/lessons/NewLesson";
import { ViewCollection } from "./views/collections/ViewCollection";
import { MyTerms } from "./views/terms/MyTerms";
import { DeveloperTools } from "./views/developer-tools/DeveloperTools";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <HashRouter>
      <UserStateProvider>
        <Routes>
          <Route path="/" element={<App />}>
            <Route path="/" element={<Dashboard />} />
            <Route
              path="collections/:collectionId"
              element={<ViewCollection />}
            />
            <Route path="sets">
              <Route path="browse">
                <Route index element={<BrowseSets />} />
                <Route path=":setId" element={<ViewSet />} />
              </Route>
              <Route path="my" element={<MySets />} />
            </Route>
            <Route path="terms" element={<MyTerms />} />
            <Route path="lessons">
              <Route index element={<LessonArchive />} />
              <Route path=":lessonId" element={<ViewLesson />} />
              {/* "reviewOnly" is an optional parameter so we make two routes https://stackoverflow.com/questions/70005601/alternate-way-for-optional-parameters-in-v6 */}
              <Route path="new/:numChallenges/">
                <Route path="" element={<NewLesson />} />
                <Route path=":reviewOnly" element={<NewLesson />} />
              </Route>
            </Route>
            <Route path="practice">
              <Route index element={<Navigate to="/lessons/" replace />} />
              <Route path=":lessonId/*" element={<PracticeLesson />}></Route>
            </Route>
            <Route path="developer-tools" element={<DeveloperTools />} />
          </Route>
        </Routes>
      </UserStateProvider>
    </HashRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
