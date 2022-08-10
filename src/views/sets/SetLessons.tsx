import { ReactElement, useEffect, useMemo } from "react";
import { Navigate, useParams } from "react-router-dom";
import { StyledLink } from "../../components/StyledLink";
import { VocabSet, vocabSets } from "../../data/vocabSets";
import { groupTermsIntoLessons } from "../../spaced-repetition/groupTermsIntoLessons";
import { useLeitnerBoxContext } from "../../spaced-repetition/LeitnerBoxProvider";
import {
  createSetLesson,
  Lesson,
  nameForLesson,
  useLessons,
} from "../../spaced-repetition/LessonsProvider";
import { getToday } from "../../utils/dateUtils";

export function SetLessons(): ReactElement {
  const { setId } = useParams();
  if (!setId) return <Navigate to="/sets" replace />;
  const set = vocabSets[setId];
  return <_SetLessons set={set}></_SetLessons>;
}

function _SetLessons({ set }: { set: VocabSet }): ReactElement {
  const { lessons, refreshLessons } = useLessons();
  const today = getToday();
  const currentLessonsForSet = useMemo(
    () =>
      Object.values(lessons).filter(
        (l) => l.type === "SET" && l.setId === set.id && l.createdFor === today
      ),
    [lessons, today]
  );
  const leitnerBoxes = useLeitnerBoxContext();

  useEffect(() => {
    if (
      currentLessonsForSet.filter((l) => l.completedAt === null).length === 0
    ) {
      console.log({ set, currentLessonsForSet });
      // if there are no lessons for this set today, make some!
      const newLessons: Lesson[] = groupTermsIntoLessons(
        set.terms.map((term) => leitnerBoxes.state.terms[term])
      ).map((lesson, idx) =>
        createSetLesson(
          lesson.map((s) => s.key),
          set.id,
          idx
        )
      );
      console.log(`creating ${newLessons.length} new set lessons`);
      refreshLessons(newLessons, {
        type: "SET",
        setId: set.id,
      });
    }
  }, [set, currentLessonsForSet.length]);

  return currentLessonsForSet.length === 0 ? (
    <p>Creating lessons for new set...</p>
  ) : (
    <ul>
      {currentLessonsForSet.map((lesson, idx) => (
        <li key={idx}>
          <StyledLink to={`/practice/${lesson.id}`}>
            {nameForLesson(lesson)} - {lesson.terms.length} terms
          </StyledLink>
        </li>
      ))}
    </ul>
  );
}
