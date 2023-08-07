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
    border-radius: ${theme.borderRadii.md};
    outline: none;
    background-color: ${theme.colors.WHITE};
    border: 1px solid ${theme.hanehldaColors.BORDER_GRAY};
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
  text-transform: uppercase;

  box-sizing: border-box;

  background: #ffea9f;
  border: 1px solid #000000;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 30px;

  font-family: "Inika";
  font-style: normal;
  font-weight: 700;
  font-size: 40px;
  line-height: 52px;
  text-align: center;

  color: #464d50;

  display: block;
  width: 100%;
`;
