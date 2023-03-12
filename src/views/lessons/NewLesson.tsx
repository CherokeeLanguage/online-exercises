import { ReactElement, useEffect, useMemo } from "react";
import { Navigate, useParams } from "react-router-dom";
import { v4 } from "uuid";
import { SectionHeading } from "../../components/SectionHeading";
import { StyledLink } from "../../components/StyledLink";
import { useAnalyticsPageName } from "../../firebase/hooks";
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

  const {
    createNewLesson,
    lessons,
    ephemeral: { lessonCreationError },
  } = useUserStateContext();

  const lessonError =
    lessonCreationError?.lessonId === newLessonId ? lessonCreationError : null;

  useEffect(() => {
    if (!(newLessonId in lessons)) {
      createNewLesson(newLessonId, numChallenges, reviewOnly);
    }
  }, [lessons, newLessonId]);

  if (lessonError)
    return (
      <div>
        <SectionHeading>Uh oh!</SectionHeading>
        <ErrorAdvice error={lessonError} numChallenges={numChallenges} />
      </div>
    );
  else if (newLessonId in lessons)
    return <Navigate to={`/practice/${newLessonId}`} />;
  else return <SectionHeading>Creating lesson...</SectionHeading>;
}

function ErrorAdvice({
  error,
  numChallenges,
}: {
  error: LessonCreationError;
  numChallenges: number;
}): ReactElement {
  useAnalyticsPageName("Lesson creation error");
  switch (error.type) {
    case LessonCreationErrorType.NOT_ENOUGH_NEW_TERMS_FOR_LESSON:
      return (
        <>
          <p>There are not enough new terms for a lesson.</p>
          <p>
            Consider adding some{" "}
            <StyledLink to="/vocabulary">new terms</StyledLink> or wrapping up
            for the day!
          </p>
        </>
      );
    case LessonCreationErrorType.NOT_ENOUGH_TERMS_FOR_REVIEW_LESSON:
      return (
        <>
          <p>
            There are not enough terms up for review to make a whole lesson.
          </p>
          <p>
            Consider doing a lesson with{" "}
            <StyledLink to={`/lessons/new/${numChallenges}`}>
              some new vocabulary
            </StyledLink>
            .
          </p>
        </>
      );
  }
}
