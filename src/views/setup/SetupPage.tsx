import { ReactElement } from "react";
import { AuthProvider } from "../../firebase/AuthProvider";
import { UserStateProvider } from "../../providers/UserStateProvider";
import { SetupWizard } from "./SetupWizard";

export function SetupPage(): ReactElement {
  return (
    <AuthProvider>
      <UserStateProvider redirectToSetup={false}>
        <SetupWizard />
      </UserStateProvider>
    </AuthProvider>
  );
}
