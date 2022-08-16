import React from "react";
import { Outlet } from "react-router-dom";
import styled from "styled-components";
import { SideBar } from "./SideBar";

const AppWrapper = styled.div`
  height: 100vh;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: row;
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
  padding: 16px;
  margin: 0 auto;
`;

function App() {
  return (
    <AppWrapper>
      <SideBar />
      <AppBody>
        <AppContent>
          <Outlet />
        </AppContent>
      </AppBody>
    </AppWrapper>
  );
}

export default App;
