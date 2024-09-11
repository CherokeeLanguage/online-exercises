import styled, { css } from "styled-components";
import { theme } from "../../theme";

export const Form = styled.form<{ standalone?: true }>`
  ${({ standalone }) =>
    standalone &&
    css`
      max-width: 400px;
      margin: auto;
    `}
  input, select {
    margin: 6px 0;
    box-sizing: border-box;
    outline: none;
    background-color: ${theme.colors.WHITE};
    border-radius: ${theme.borderRadii.md};
    border: "none";
    box-shadow: ${theme.boxShadow.light};
    width: 100%;
    padding: 16px;
    font-size: ${theme.fontSizes.md};
    ::placeholder {
      color: ${theme.hanehldaColors.TEXT_LIGHT_GRAY};
      opacity: 1;
    }
  }
`;

export const FormSubmitButton = styled.button`

  box-sizing: border-box;

  background-color: ${theme.hanehldaColors.YELLOW_BUTTON};
  &:hover {
    background-color: ${theme.hanehldaColors.YELLOW_HIGHLIGHT};
  };
  border-radius: ${theme.borderRadii.md};
  border: "none";
  box-shadow: ${theme.boxShadow.light};

  font-family: 'Noto Sans Cherokee', 'Noto Sans', sans-serif;
  font-style: normal;
  font-weight: 700;
  font-size: 40px;
  line-height: 52px;
  text-align: center;

  color: #464d50;

  display: block;
  width: 100%;
`;
