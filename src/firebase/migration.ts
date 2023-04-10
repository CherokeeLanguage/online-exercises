import { User } from "firebase/auth";
import { ReviewResult } from "../state/reducers/leitnerBoxes";
import { lessonKey } from "../state/reducers/lessons";
import { LegacyUserState } from "../state/useUserState";
import { setTyped, lessonMetadataPath, lessonReviewedTermsPath } from "./paths";

export async function uploadAllLessonDataFromLocalStorage(
  user: User
): Promise<void> {
  const localStorageUserState: LegacyUserState = JSON.parse(
    localStorage.getItem("user-state") || "{}"
  );

  await Promise.all(
    Object.values(localStorageUserState.lessons ?? {}).flatMap((lesson) => {
      const reviewedTerms: Record<string, ReviewResult> = JSON.parse(
        localStorage.getItem(lessonKey(lesson.id) + `/reviewed-terms`) ?? "{}"
      );
      return [
        setTyped(lessonMetadataPath(user, lesson.id), lesson),
        setTyped(lessonReviewedTermsPath(user, lesson.id), {
          reviewedTerms,
          lessonId: lesson.id,
        }),
      ];
    })
  );
}
