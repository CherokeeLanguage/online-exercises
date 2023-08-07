// A list of constants to be used for links in the app
// This _must_ be updated as routes are added / change.

export const DashboardPath = "/";
export const VocabularyPath = "/vocabulary";
export const BrowseCollectionsPath = VocabularyPath;
export const ViewSetPath = (setId: string) => `${VocabularyPath}/set/${setId}`;
export const ViewCollectionPath = (collectionId: string) =>
  `${VocabularyPath}/collection/${collectionId}`;
export const MySetsPath = "/my-sets";
export const MyTermsPath = "/terms";
export const LessonsPath = "/lessons";
export const ViewLessonPath = (lessonId: string) =>
  `${LessonsPath}/${lessonId}`;
export const PracticePath = `/practice`;
export const PracticeLessonPath = (lessonId: string) =>
  `${PracticePath}/${lessonId}`;
export const SettingsPath = `/settings`;

export const SignInPath = `/signin`;
export const CreateAccountPath = `/signin/new`;

export const SetupNewAccountPath = `/setup`;
