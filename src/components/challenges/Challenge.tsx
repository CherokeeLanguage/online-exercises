import { ReactNode } from "react";
import {
  ChallengeCard,
  ChallengeContainer,
  ChallengeContent,
  ChallengeDescription,
} from "./styled";

export function Challenge({
  description,
  content,
  after,
}: {
  description: ReactNode;
  content: ReactNode;
  after: ReactNode;
}) {
  return (
    <ChallengeContainer>
      <ChallengeContent>
        <ChallengeDescription>{description}</ChallengeDescription>
        <ChallengeCard>{content}</ChallengeCard>
      </ChallengeContent>
      {after}
    </ChallengeContainer>
  );
}
