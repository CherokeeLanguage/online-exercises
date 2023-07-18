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

const BannerWrapper = styled.div`
  /* position: absolute;
  top: 0;
  left: 0;
  right: 0; */
  padding: 10px;
  margin: 0;
`;

const StyledErrorBanner = styled.div`
  margin: 0 auto;
  max-width: 400px;
  border-radius: ${theme.borderRadii.md};
  box-sizing: border-box;
  font-size: 1em;
  background-color: ${theme.hanehldaColors.ERROR_RED};
  color: ${theme.hanehldaColors.DARK_RED};
  display: flex;
  text-align: center;
  padding: 4px;
  border: 1px solid ${theme.hanehldaColors.DARK_RED};
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
    <BannerWrapper>
      <StyledErrorBanner>
        <span>{error}</span>
        <button onClick={() => setError(null)}>
          <AiOutlineClose display="inline" />
        </button>
      </StyledErrorBanner>
    </BannerWrapper>
  ) : null;
}
