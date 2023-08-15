import styled from "styled-components";
import { theme } from "../../theme";

export const ContentWrapper = styled.div`
  background-color: white;
`;

export const StyledCourseDescription = styled.div`
  color: white;
  background-color: ${theme.hanehldaColors.DARK_BLUE};
  padding: 20px;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
  h2 {
    margin-top: 0;
  }
`;
export const ShowMoreButton = styled.button`
  display: block;
  background-color: ${theme.colors.WHITE};
  border: none;
  border-radius: ${theme.borderRadii.md};
  padding: 10px;
  font-weight: bold;
  color: ${theme.hanehldaColors.DARK_GRAY};
  margin: 0 auto;
`;

export const ActionsWrapper = styled.div`
  text-align: center;
  margin: 16px;
  display: flex;
  gap: 16px;
  justify-content: space-around;
`;
