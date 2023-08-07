import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useUserStateContext } from "./providers/UserStateProvider";

export function App() {
  const { config } = useUserStateContext();
  var userNeedsSetup: boolean =
    config.userEmail === null ||
    config.groupId === null ||
    config.whereFound === null;
  if (userNeedsSetup) return <Navigate to="setup/" />;

  return <Outlet />;
}
