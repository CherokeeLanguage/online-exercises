import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { LeitnerBoxProvider } from "./utils/LeitnerBoxProvider";
import { Lessons } from "./lessons";
import { Overview } from "./Overview";
import { Practice } from "./Practice";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <HashRouter>
      <LeitnerBoxProvider numBoxes={15} localStorageKey="global-leitner-boxes">
        <Routes>
          <Route path="/" element={<App />}>
            <Route path="/" element={<Lessons />} />
            <Route path="/overview" element={<Overview />} />
            <Route path="/practice/*" element={<Practice />} />
          </Route>
        </Routes>
      </LeitnerBoxProvider>
    </HashRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
