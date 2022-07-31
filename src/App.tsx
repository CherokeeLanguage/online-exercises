import React from "react";
import { Route, Routes } from "react-router-dom";
import styled from "styled-components";
import { Sidebar } from "./Sidebar";
import { routes } from "./routes";

const AppWrapper = styled.div`
  text-align: center;
  width: 100vw;
  height: 100vh;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
`;

const AppHeader = styled.h1`
  font-weight: bold;
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
    <AppWrapper>
      <AppHeader>Cherokee Language Lessons Exercises</AppHeader>
      <AppBody>
        <Sidebar />
        <AppContent>
          <Routes>
            {routes.map((route, i) => (
              <Route key={i} path={route.path} element={route.element()} />
            ))}
          </Routes>
        </AppContent>
      </AppBody>
    </AppWrapper>
  );
}

export default App;
