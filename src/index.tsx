import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import App from "./App";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { BrowseCollections } from "./views/vocabulary/BrowseCollections";
import { ViewCollection } from "./views/vocabulary/ViewCollection";
import { MySets } from "./views/vocabulary/MySets";
import { ViewSet } from "./views/vocabulary/ViewSet";
// import { Overview } from "./Overview";
import { UserStateProvider } from "./state/UserStateProvider";
import { Dashboard } from "./views/dashboard/Dashboard";
import { LessonArchive } from "./views/lessons/LessonArchive";
import { ViewLesson } from "./views/lessons/ViewLesson";
import { PracticeLesson } from "./views/practice/PracticeLesson";
import { NewLesson } from "./views/lessons/NewLesson";

import { MyTerms } from "./views/terms/MyTerms";
import { Settings } from "./views/settings/Settings";
import { AuthProvider } from "./firebase/AuthProvider";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider>
        <UserStateProvider>
          <Routes>
            <Route path="/" element={<App />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="vocabulary">
                <Route index element={<BrowseCollections />} />
                <Route path="set/:setId" element={<ViewSet />} />
                <Route
                  path="collection/:collectionId"
                  element={<ViewCollection />}
                />
              </Route>
              <Route path="my-sets" element={<MySets />}></Route>
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
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </UserStateProvider>
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
