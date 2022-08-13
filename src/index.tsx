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
import { BrowseLessons } from "./views/lessons/BrowseLessons";
import { ViewLesson } from "./views/lessons/ViewLesson";
import { PracticeLesson } from "./views/practice/Practice";

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
            <Route path="sets">
              <Route path="browse">
                <Route index element={<BrowseSets />} />
                <Route path=":setId" element={<ViewSet />} />
              </Route>
              <Route path="my" element={<MySets />} />
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
      </UserStateProvider>
    </HashRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
