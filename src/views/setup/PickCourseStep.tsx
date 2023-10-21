import {
  ChangeEvent,
  FormEvent,
  ReactElement,
  useContext,
  useState,
} from "react";
import {
  CHEROKEE_LANGUAGE_LESSONS_COLLLECTION,
  collections,
  VocabSet,
} from "../../data/vocabSets";
import { Step, wizardContext } from "./SetupWizard";
import { Form } from "../signin/common";
import { Fieldset } from "../../components/Fieldset";
import { VisuallyHidden } from "../../components/VisuallyHidden";
import styled, { css } from "styled-components";
import { theme } from "../../theme";
import { BackButton, Hr, NavigationButtons, NextButton } from "./common";

export const PickCourseStep: Step = {
  name: "Pick course",
  Component: PickCourse,
};

const CourseList = styled.div`
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  gap: 40px;
`;

const CourseLabel = styled.label<{ checked: boolean }>`
  flex: 0 max-content;
  font-weight: bold;
  border-radius: ${theme.borderRadii.md};
  padding: 20px;
  color: ${theme.colors.WHITE};
  background-color: ${theme.hanehldaColors.DARK_BLUE};
  border: 1px solid black;
  em {
    color: ${theme.colors.LIGHT_GRAY};
    font-style: normal;
  }
  ${({ checked }) =>
    checked &&
    css`
      background-color: ${theme.hanehldaColors.DARK_GREEN};
      box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
    `}
`;

function PickCourse(): ReactElement {
  const {
    finishPickCourse,
    state: {
      data: { collectionId: initialId },
    },
  } = useContext(wizardContext);

  const [collectionId, setCollectionId] = useState<string | undefined>(
    initialId
  );

  function onRadioChanged(e: ChangeEvent<HTMLInputElement>) {
    const collectionId = e.target.value;
    setCollectionId(collectionId);
  }
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (collectionId) finishPickCourse({ collectionId });
  }

  function totalTerms(vocab: VocabSet[]) {
    var t = 0;

    vocab.map((vocabSet) => (t += vocabSet.terms.length));

    return t;
  }

  return (
    <div>
      <p>
        <strong>Content on Hanehlda is broken up into courses.</strong> Some of
        these will follow along with a free textbook, like{" "}
        <em>See Say Write</em> or <em>We are Learning Cherokee</em>.
      </p>

      <Hr />
      <Form standalone onSubmit={onSubmit}>
        <Fieldset>
          <legend>Select your first course below</legend>
          <CourseList>
            {Object.values(collections)
              .filter(
                (collection) =>
                  // Let's not sign people up for this
                  collection.id !== CHEROKEE_LANGUAGE_LESSONS_COLLLECTION
              )
              .map((collection, idx) => (
                <CourseLabel
                  htmlFor={collection.id}
                  key={idx}
                  checked={collectionId === collection.id}
                >
                  <VisuallyHidden>
                    <input
                      name={"first-collection"}
                      type="radio"
                      value={collection.id}
                      id={collection.id}
                      onChange={onRadioChanged}
                      checked={collectionId === collection.id}
                      required
                    />
                  </VisuallyHidden>
                  <span>
                    {collection.title}{" "}
                    <em>({totalTerms(collection.sets)} terms)</em>
                  </span>
                </CourseLabel>
              ))}
          </CourseList>
        </Fieldset>
        <Hr />
        <NavigationButtons
          left={<BackButton />}
          right={<NextButton type="submit">Get started!</NextButton>}
        />
      </Form>
    </div>
  );
}
