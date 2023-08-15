import { Navigate, Route, Routes } from "react-router-dom";
import { App } from "../App";
import { LessonArchive } from "../views/lessons/LessonArchive";
import { ViewLesson } from "../views/lessons/ViewLesson";
import { PracticeLesson } from "../views/practice/PracticeLesson";
import { MyTerms } from "../views/terms/MyTerms";
import { CoursesPage } from "../views/vocabulary/CoursesPage";
import { MySets } from "../views/vocabulary/MySets";
import { ViewCollection } from "../views/vocabulary/ViewCollection";
import { ViewSet } from "../views/vocabulary/ViewSet";
import { Settings } from "../views/settings/Settings";
import { SignInPage } from "../views/signin/SignInPage";
import { CreateAccountPage } from "../views/signin/CreateAccountPage";
import { ForgotPasswordPage } from "../views/signin/ForgotPasswordPage";
import { SetupPage } from "../views/setup/SetupPage";
import { Providers } from "../providers/Providers";
import { LearnPage } from "../views/learn/LearnPage";
import { SearchPage } from "../views/search/SearchPage";
import { CommunityPage } from "../views/community/CommunityPage";

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
          <Route path="/" element={<LearnPage />} />
          <Route path="vocabulary">
            <Route index element={<CoursesPage />} />
            <Route path="set/:setId" element={<ViewSet />} />
            <Route
              path="collection/:collectionId"
              element={<ViewCollection />}
            />
          </Route>
          <Route path="search">
            <Route index element={<SearchPage />} />
            <Route path=":query" element={<SearchPage />} />
          </Route>
          <Route path="community" element={<CommunityPage />}></Route>
          {/* <Route path="my-sets" element={<MySets />}></Route> */}
          {/* <Route path="terms" element={<MyTerms />} /> */}
          <Route path="lessons">
            <Route index element={<LessonArchive />} />
            <Route path=":lessonId" element={<ViewLesson />} />
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
