import {
  useState,
  ReactElement,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { useTransition } from "../utils/useTransition";
import styled, { css } from "styled-components";
import { devices, theme } from "../theme";
import { useFeedbackChimes } from "../utils/useFeedbackChimes";

export enum AnswerState {
  CORRECT = "CORRECT",
  INCORRECT = "INCORRECT",
  UNANSWERED = "UNANSWERED",
}

interface AnswersWithFeedbackContext {
  answerState: AnswerState;
  selectedAnswer: number | null;
  onAnswerClicked: (correct: boolean, answerIdx: number) => void;
  /** Hide user feedback and present next question */
  endFeedback: () => void;
}

const answersWithFeedbackContext = createContext<AnswersWithFeedbackContext>(
  {} as AnswersWithFeedbackContext
);

const AnswersWrapper = styled.div`
  position: relative;
`;

const Answers = styled.div<{ transitioning: boolean }>`
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;
  @media screen and (${devices.laptop}) {
    grid-template-columns: 1fr 1fr;
  }
  grid-template-rows: auto auto;
  transition-property: opacity 250msec;
  opacity: ${({ transitioning }) => (transitioning ? "70%" : "100%")};
`;

const HintContainter = styled.div`
  position: absolute;
  padding: 16px;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const HintContent = styled.div`
  min-height: 100%;
  background: ${theme.colors.LIGHTEST_RED};
  border: 4px solid ${theme.colors.DARK_RED};
  border-radius: ${theme.borderRadii.sm};
  box-shadow: ${theme.boxShadow.light};
  padding: 8px;
`;

export function AnswersWithFeedback({
  reviewCurrentCard,
  IncorrectAnswerHint,
  hintLocation,
  feedbackDuration = 1500,
  children,
}: {
  reviewCurrentCard: (correct: boolean) => void;
  IncorrectAnswerHint: () => ReactElement;
  hintLocation: "overAnswers" | "underAnswers";
  feedbackDuration?: number;
  children: ReactNode;
}) {
  const { playCorrectChime, playIncorrectChime } = useFeedbackChimes();

  const [answerState, setAnswerState] = useState(AnswerState.UNANSWERED);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const { transitioning, startTransition, endTransition } = useTransition({
    duration: feedbackDuration,
  });

  function onAnswerClicked(correct: boolean, answerIdx: number) {
    setSelectedAnswer(answerIdx);
    setAnswerState(correct ? AnswerState.CORRECT : AnswerState.INCORRECT);
    (correct ? playCorrectChime : playIncorrectChime)();
    // only wait for user input if it was incorrect
    const waitForUser = !correct;
    startTransition(waitForUser, () => {
      reviewCurrentCard(correct);
      setAnswerState(AnswerState.UNANSWERED);
      setSelectedAnswer(null);
    });
  }

  return (
    <answersWithFeedbackContext.Provider
      value={{
        answerState,
        onAnswerClicked,
        selectedAnswer,
        endFeedback: endTransition,
      }}
    >
      <AnswersWrapper>
        <Answers transitioning={transitioning}>{children}</Answers>
        {answerState === AnswerState.INCORRECT &&
          hintLocation === "overAnswers" && (
            <HintContainter>
              <HintContent>
                <IncorrectAnswerHint />
              </HintContent>
            </HintContainter>
          )}
        {answerState === AnswerState.INCORRECT &&
          hintLocation === "underAnswers" && <IncorrectAnswerHint />}
      </AnswersWrapper>
    </answersWithFeedbackContext.Provider>
  );
}
const StyledAnswerCard = styled.button<{
  answerState: AnswerState;
  correct: boolean;
  selected: boolean;
}>`
  background-color: ${theme.hanehldaColors.WHITE_BUTTON};
  &:hover {
    background-color: ${theme.hanehldaColors.WHITE_HIGHLIGHT};
  }
  color: ${theme.hanehldaColors.DARK_GRAY};
  border-radius: ${theme.borderRadii.sm};
  border: "none";
  box-shadow: ${theme.boxShadow.light};
  @media screen and (${devices.laptop}) {
    padding: 24px;
  }
  padding: 4px;
  font-size: ${theme.fontSizes.sm};

  ${({ answerState, correct }) =>
    answerState !== AnswerState.UNANSWERED &&
    (correct
      ? css`
          background-color: ${theme.hanehldaColors.CORRECT_GREEN};
          color: ${theme.hanehldaColors.DARK_GREEN_TEXT};
          &:hover {
            background-color: ${theme.hanehldaColors.CORRECT_GREEN};
          }
        `
      : css`
          background-color: ${theme.hanehldaColors.ERROR_RED};
          &:hover {
            background-color: ${theme.hanehldaColors.ERROR_RED};
          }
          border-color: ${theme.hanehldaColors.DARK_RED};
          color: ${theme.hanehldaColors.DARK_RED_TEXT};
        `)}
  ${({ selected }) =>
    selected &&
    css`
      border-bottom: 4px solid rgba(0,0,0,0.5);
    `}

    &:disabled {
    cursor: default;
  }
`;

export function useAnswersWithFeedback() {
  const value = useContext(answersWithFeedbackContext);
  if (!value)
    throw new Error(
      "This hook should only be used on children of the AnswersWithFeedback component"
    );
  return value;
}

export function AnswerCard({
  children,
  correct,
  idx,
}: {
  children: ReactNode;
  correct: boolean;
  idx: number;
}): ReactElement {
  const { onAnswerClicked, answerState, selectedAnswer } =
    useAnswersWithFeedback();
  return (
    <StyledAnswerCard
      onClick={() => onAnswerClicked(correct, idx)}
      answerState={answerState}
      correct={correct}
      selected={selectedAnswer === idx}
      disabled={answerState !== AnswerState.UNANSWERED}
    >
      {children}
    </StyledAnswerCard>
  );
}
