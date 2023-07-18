import React, { ReactNode, useContext, useState } from "react";
import styled from "styled-components";
import { AiOutlineClose } from "react-icons/ai";
import { theme } from "../theme";

interface ErrorBannerContext {
  error: ReactNode;
  setError: (newError: ReactNode) => void;
}

export const errorBannerContext = React.createContext<ErrorBannerContext>(
  {} as ErrorBannerContext
);

export function ErrorBannerProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState<ReactNode>();

  return (
    <errorBannerContext.Provider value={{ error, setError }}>
      {children}
    </errorBannerContext.Provider>
  );
}

const StyledErrorBanner = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  box-sizing: border-box;
  padding: 30px;
  font-size: 1em;
  background-color: ${theme.hanehldaColors.LIGHT_RED};
  display: flex;
  text-align: center;
  border-bottom: ${theme.hanehldaColors.DARK_RED} 4px solid;
  span {
    flex: 1;
  }
  button {
    flex: 0 max-content;
    border: none;
    outline: none;
    background: none;
    font-size: inherit;
    display: flex;
    align-items: center;
  }
`;

export function ErrorBanner() {
  const { error, setError } = useContext(errorBannerContext);
  return error ? (
    <StyledErrorBanner>
      <span>{error}</span>
      <button onClick={() => setError(null)}>
        <AiOutlineClose display="inline" />
      </button>
    </StyledErrorBanner>
  ) : null;
}
