import { ReactNode } from "react";
import { UserStateProvider } from "./UserStateProvider";
import { AuthProvider } from "../firebase/AuthProvider";
import { Outlet } from "react-router-dom";

export function Providers() {
  return (
    <AuthProvider>
      <UserStateProvider>
        <Outlet />
      </UserStateProvider>
    </AuthProvider>
  );
}
