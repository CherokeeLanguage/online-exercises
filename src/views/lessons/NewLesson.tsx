import { useEffect, useMemo } from "react";
import { Navigate, useParams } from "react-router-dom";
import { v4 } from "uuid";
import { useUserStateContext } from "../../state/UserStateProvider";

export function NewLesson() {
  const { numChallenges, reviewOnly: reviewOnlyString } = useParams();

  if (numChallenges === undefined)
    throw new Error("Must specify number of challenges desired for lesson");

  const reviewOnly = reviewOnlyString === "true";

  const { createNewLesson, lessons } = useUserStateContext();

  const newLessonId = useMemo(() => v4(), []);

  useEffect(() => {
    if (!(newLessonId in lessons)) {
      createNewLesson(newLessonId, Number.parseInt(numChallenges), reviewOnly);
    }
  }, [lessons, newLessonId]);

  if (newLessonId in lessons)
    return <Navigate to={`/practice/${newLessonId}`} />;
  else return <p>Creating lesson...</p>;
}
