import React from "react";
import { Outlet } from "react-router-dom";
import styled from "styled-components";
import { Sidebar } from "./Sidebar";
import { LeitnerBoxProvider } from "./utils/LeitnerBoxProvider";

const AppWrapper = styled.div`
  text-align: center;
  height: 100vh;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
`;

const AppHeader = styled.header`
  h1 {
    font-weight: bold;
    margin: 0;
    padding: 8px;
  }
  border-bottom: 1px solid #111;
  margin: 0;
  padding: 8px;
`;

const AppBody = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
`;

const AppContent = styled.div`
  flex: 1;
`;

function App() {
  return (
    <LeitnerBoxProvider numBoxes={15} localStorageKey="global-leitner-boxes">
      <AppWrapper>
        <AppHeader>
          <h1>Cherokee Language Lessons Exercises</h1>
          <Sidebar />
        </AppHeader>
        <AppBody>
          <AppContent>
            <Outlet />
          </AppContent>
        </AppBody>
      </AppWrapper>
    </LeitnerBoxProvider>
  );
}

export default App;
