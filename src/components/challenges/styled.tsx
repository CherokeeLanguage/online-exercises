import styled from "styled-components";
import { devices, theme } from "../../theme";

export const ChallengeContainer = styled.div`
  margin: auto;
  text-align: center;
`;

export const ChallengeContent = styled.div`
  text-align: left;
  p {
    margin: 0;
  }
  padding: 0 20px;
`;

export const ChallengeCard = styled.div`
  width: 100%;
  box-sizing: border-box;
  flex: 1;
  margin: 30px auto;
  padding: 24px;
  border-radius: ${theme.borderRadii.sm};
  border: "none";
  box-shadow: ${theme.boxShadow.thick};
  align-items: center;
  outline: none;
  background: none;
  p {
    flex: 1;
    text-align: left;
    margin: 0;
  }
  button {
    font-size: ${theme.fontSizes.md};
  }
  background: ${theme.colors.WHITE};
  color: black;
  @media screen and (${devices.tablet}) {
    font-size: ${theme.fontSizes.lg};
  }
`;

export const ChallengeDescription = styled.p`
  margin: 16px !important;
  font-size: ${theme.fontSizes.md};
  font-weight: bold;
  color: ${theme.hanehldaColors.DARK_GRAY};
  text-align: center;
`;

export const StyledControlRow = styled.div`
  display: flex;
  justify-content: space-between;
  /* margin-bottom: 16px; */
  text-align: center;
`;

export const StyledControl = styled.div`
  flex: 0 max-content;
  &:only-child {
    margin: 0 auto;
  }
`;
