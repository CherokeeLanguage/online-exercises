import {
  useState,
  ReactElement,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { useTransition } from "../utils/useTransition";
import styled, { css } from "styled-components";
import { theme } from "../theme";
import { useFeedbackChimes } from "../utils/useFeedbackChimes";

export enum AnswerState {
  CORRECT = "CORRECT",
  INCORRECT = "INCORRECT",
  UNANSWERED = "UNANSWERED",
}

interface AnswersWithFeedbackContext {
  answerState: AnswerState;
  onAnswerClicked: (correct: boolean, answerIdx: number) => void;
  selectedAnswer: number | null;
  /** Hide user feedback and present next question */
  endFeedback: () => void;
}

const answersWithFeedbackContext =
  createContext<AnswersWithFeedbackContext | null>(null);

const AnswersWrapper = styled.div`
  position: relative;
  margin-bottom: 24px;
`;

const Answers = styled.div<{ transitioning: boolean }>`
  display: grid;
  grid-template-columns: 1fr 1fr;
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
  border-radius: 8px;
  padding: 8px;
`;

export function AnswersWithFeedback({
  reviewCurrentCard,
  IncorrectAnswerHint,
  hintLocation,
  feedbackDuration = 500,
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
          hintLocation === "underAnswers" && (
            <HintContent>
              <IncorrectAnswerHint />
            </HintContent>
          )}
      </AnswersWrapper>
    </answersWithFeedbackContext.Provider>
  );
}
const StyledAnswerCard = styled.button<{
  answerState: AnswerState;
  correct: boolean;
}>`
  background: #fff;
  border: 4px solid ${theme.colors.TEXT_GRAY};
  color: ${theme.colors.TEXT_GRAY};
  font-weight: bold;
  border-radius: 8px;
  padding: 24px;
  font-size: ${theme.fontSizes.sm};
  margin: 16px;

  ${({ answerState, correct }) =>
    (correct &&
      answerState === AnswerState.CORRECT &&
      css`
        border-color: ${theme.colors.DARK_GREEN};
        color: ${theme.colors.DARK_GREEN};
      `) ||
    (answerState === AnswerState.INCORRECT &&
      css`
        border-color: ${theme.colors.HARD_YELLOW};
        color: ${theme.colors.DARK_GREEN};
      `)}
  ${({ answerState, correct }) =>
    !correct &&
    answerState === AnswerState.INCORRECT &&
    css`
      border-color: ${theme.colors.DARK_RED};
      color: ${theme.colors.DARK_RED};
    `}

    &:disabled {
    cursor: not-allowed;
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
  const { onAnswerClicked, answerState } = useAnswersWithFeedback();
  return (
    <StyledAnswerCard
      onClick={() => onAnswerClicked(correct, idx)}
      answerState={answerState}
      correct={correct}
      disabled={answerState !== AnswerState.UNANSWERED}
    >
      {children}
    </StyledAnswerCard>
  );
}
