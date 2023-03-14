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

interface AnswersWithFeedbackContext {
  answerState: AnswerState;
  onAnswerClicked: (correct: boolean) => void;
}

const answersWithFeedbackContext =
  createContext<AnswersWithFeedbackContext | null>(null);

const Answers = styled.div<{ transitioning: boolean }>`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  transition-property: opacity 250msec;
  opacity: ${({ transitioning }) => (transitioning ? "70%" : "100%")};
`;

enum AnswerState {
  CORRECT = "CORRECT",
  INCORRECT = "INCORRECT",
  UNANSWERED = "UNANSWERED",
}

export function AnswersWithFeedback({
  reviewCurrentCard,
  feedbackDuration = 250,
  children,
}: {
  reviewCurrentCard: (correct: boolean) => void;
  feedbackDuration?: number;
  children: ReactNode;
}) {
  const { playCorrectChime, playIncorrectChime } = useFeedbackChimes();

  const [answerState, setAnswerState] = useState(AnswerState.UNANSWERED);
  const { transitioning, startTransition } = useTransition({
    duration: feedbackDuration,
  });

  function onAnswerClicked(correct: boolean) {
    setAnswerState(correct ? AnswerState.CORRECT : AnswerState.INCORRECT);
    (correct ? playCorrectChime : playIncorrectChime)();
    startTransition(() => {
      reviewCurrentCard(correct);
      setAnswerState(AnswerState.UNANSWERED);
    });
  }

  return (
    <answersWithFeedbackContext.Provider
      value={{ answerState, onAnswerClicked }}
    >
      <Answers transitioning={transitioning}>{children}</Answers>
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
`;

export function AnswerCard({
  children,
  correct,
}: {
  children: ReactNode;
  correct: boolean;
}): ReactElement {
  const { onAnswerClicked, answerState } = useContext(
    answersWithFeedbackContext
  )!;
  return (
    <StyledAnswerCard
      onClick={() => onAnswerClicked(correct)}
      answerState={answerState}
      correct={correct}
    >
      {children}
    </StyledAnswerCard>
  );
}
