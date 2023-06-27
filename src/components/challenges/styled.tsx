import styled from "styled-components";
import { theme } from "../../theme";

export const ChallengeContainer = styled.div`
  margin: auto;
  text-align: center;
`;

export const ChallengeContent = styled.div`
  font-size: ${theme.fontSizes.lg};
  text-align: left;
  p {
    margin: 0;
  }
`;

export const ChallengeCard = styled.div`
  width: 100%;
  box-sizing: border-box;
  flex: 1;
  margin: 30px auto;
  padding: 24px;
  border-radius: 8px;
  border: 1px solid ${theme.colors.MED_GRAY};
  align-items: center;
  outline: none;
  background: none;
  font-size: ${theme.fontSizes.lg};
  p {
    flex: 1;
    text-align: left;
    margin: 0;
  }
  background: ${theme.colors.LIGHTER_GRAY};
`;

export const ChallengeDescription = styled.p`
  margin: 16px !important;
`;

export const StyledControlRow = styled.div`
  display: flex;
  justify-content: space-around;
  margin-bottom: 16px;
  text-align: center;
`;

export const StyledControl = styled.div`
  flex: 1;
`;
