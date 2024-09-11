import styled from "styled-components";
import { theme } from "../../theme";

export const ContentWrapper = styled.div`
  background-color: white;
`;

export const StyledCourseDescription = styled.div`
  color: white;
  background-color: ${theme.hanehldaColors.DARK_BLUE};
  padding: 20px;
  box-shadow: ${theme.boxShadow.light};
  h2 {
    margin-top: 0;
  }
`;
export const ShowMoreButton = styled.button`
  display: block;
  background-color: ${theme.hanehldaColors.WHITE_BUTTON};
  &:hover {
    background-color: ${theme.hanehldaColors.WHITE_HIGHLIGHT};
  }
  border-radius: ${theme.borderRadii.md};
  border: "none";
  box-shadow: ${theme.boxShadow.light};
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
