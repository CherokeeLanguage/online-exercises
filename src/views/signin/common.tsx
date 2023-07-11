import styled from "styled-components";
import { theme } from "../../theme";

export const Page = styled.div`
  height: 100vh;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  background-color: ${theme.hanehldaColors.CREAM};
`;

export const ScrollWrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  height: 100%;
  overflow-x: auto;
`;

export const PageContent = styled.div`
  flex: 1;
  /* max-width: min(800px, 100vw); */
  margin: 0 auto;
  text-align: center;
  display: grid;
  grid-template-rows: auto auto min(1fr, 300px);
`;

export const HeaderLabel = styled.h2`
  font-size: 25px;
  font-weight: 500;
  font-family: "Noto Sans", sans-serif;
  margin: 0;
  flex: 1;
  text-align: right;
`;

export const Form = styled.form`
  input {
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
