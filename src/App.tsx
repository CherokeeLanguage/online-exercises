import React from "react";
import { Outlet } from "react-router-dom";
import styled from "styled-components";
import { NavigationBar } from "./components/NavigationBar";

const AppWrapper = styled.div`
  height: 100vh;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
`;

const AppBody = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  height: 100%;
  overflow-x: auto;
`;

const AppContent = styled.div`
  flex: 1;
  max-width: min(800px, 100vw);
  padding: 16px;
  margin: 0 auto;
`;

export function App() {
  return (
    <AppWrapper>
      <NavigationBar />
      <AppBody>
        <AppContent>
          <Outlet />
        </AppContent>
      </AppBody>
    </AppWrapper>
  );
}
