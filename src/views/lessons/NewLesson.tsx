import { ReactElement, useEffect, useMemo } from "react";
import { Navigate, useParams } from "react-router-dom";
import { v4 } from "uuid";
import { StyledLink } from "../../components/StyledLink";
import {
  LessonCreationError,
  LessonCreationErrorType,
} from "../../state/reducers/lessons/createNewLesson";
import { useUserStateContext } from "../../state/UserStateProvider";

export function NewLesson() {
  const {
    numChallenges: numChallengesString,
    reviewOnly: reviewOnlyString = "false",
  } = useParams();

  if (numChallengesString === undefined)
    throw new Error("Must specify number of challenges desired for lesson");

  const numChallenges = Number.parseInt(numChallengesString);
  const reviewOnly = reviewOnlyString === "true";

  const newLessonId = useMemo(() => v4(), [numChallenges, reviewOnly]);

  const { createNewLesson, lessons, lessonCreationError } =
    useUserStateContext();

  const lessonError =
    lessonCreationError?.lessonId === newLessonId ? lessonCreationError : null;

  useEffect(() => {
    if (!(newLessonId in lessons)) {
      createNewLesson(newLessonId, numChallenges, reviewOnly);
    }
  }, [lessons, newLessonId]);

  if (lessonError)
    return (
      <p>
        Error creating lesson:{" "}
        <ErrorAdvice error={lessonError} numChallenges={numChallenges} />
      </p>
    );
  else if (newLessonId in lessons)
    return <Navigate to={`/practice/${newLessonId}`} />;
  else return <p>Creating lesson...</p>;
}

function ErrorAdvice({
  error,
  numChallenges,
}: {
  error: LessonCreationError;
  numChallenges: number;
}): ReactElement {
  switch (error.type) {
    case LessonCreationErrorType.NOT_ENOUGH_NEW_TERMS_FOR_LESSON:
      return (
        <p>
          There are not enough new terms for a lesson. Consider adding some{" "}
          <StyledLink to="/sets/browse">new terms</StyledLink>.
        </p>
      );
    case LessonCreationErrorType.NOT_ENOUGH_TERMS_FOR_REVIEW_LESSON:
      return (
        <p>
          There are not enough terms up for review to make a whole lesson.
          Consider doing a lesson with{" "}
          <StyledLink to={`/lessons/new/${numChallenges}`}>
            some new vocabulary
          </StyledLink>
          .
        </p>
      );
  }
}
