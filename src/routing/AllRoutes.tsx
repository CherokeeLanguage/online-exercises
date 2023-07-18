import { Navigate, Route, Routes } from "react-router-dom";
import { App } from "../App";
import { Dashboard } from "../views/dashboard/Dashboard";
import { LessonArchive } from "../views/lessons/LessonArchive";
import { NewLesson } from "../views/lessons/NewLesson";
import { ViewLesson } from "../views/lessons/ViewLesson";
import { PracticeLesson } from "../views/practice/PracticeLesson";
import { MyTerms } from "../views/terms/MyTerms";
import { BrowseCollections } from "../views/vocabulary/BrowseCollections";
import { MySets } from "../views/vocabulary/MySets";
import { ViewCollection } from "../views/vocabulary/ViewCollection";
import { ViewSet } from "../views/vocabulary/ViewSet";
import { Settings } from "../views/settings/Settings";
import { SignInPage } from "../views/signin/SignInPage";
import { CreateAccountPage } from "../views/signin/CreateAccountPage";
import { ForgotPasswordPage } from "../views/signin/ForgotPasswordPage";
import { SetupPage } from "../views/setup/SetupPage";
import { Providers } from "../providers/Providers";

/**
 * All the routes for the app.
 *
 * Note: if you update this file, you should also updates the paths.ts file in
 * this folder.
 */
export function AllRoutes() {
  return (
    <Routes>
      <Route path="/signin">
        <Route index element={<SignInPage />} />
        <Route path="new" element={<CreateAccountPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
      </Route>
      <Route path="/" element={<Providers />}>
        <Route path="/setup">
          <Route index element={<SetupPage />} />
        </Route>
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
      </Route>
    </Routes>
  );
}
