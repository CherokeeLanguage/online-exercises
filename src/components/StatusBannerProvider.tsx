import React, { ReactNode, useContext, useState } from "react";
import styled, { css } from "styled-components";
import { AiOutlineClose } from "react-icons/ai";
import { theme } from "../theme";

interface StatusBannerContext {
  status: Status | null;
  setStatus: (newState: Status | null) => void;
  setError: (error: ReactNode) => void;
}

export const statusBannerContext = React.createContext<StatusBannerContext>(
  {} as StatusBannerContext
);

export interface Status {
  type: "success" | "error";
  node: ReactNode;
}

export function StatusBannerProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status | null>(null);

  return (
    <statusBannerContext.Provider
      value={{
        status,
        setStatus,
        setError(error) {
          setStatus({ type: "error", node: error });
        },
      }}
    >
      {children}
    </statusBannerContext.Provider>
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

const StyledBanner = styled.div<{ type: Status["type"] }>`
  margin: 0 auto;
  max-width: 400px;
  border-radius: ${theme.borderRadii.md};
  box-sizing: border-box;
  font-size: 1em;
  display: flex;
  text-align: center;
  padding: 4px;
  ${({ type }) =>
    type === "error" &&
    css`
      background-color: ${theme.hanehldaColors.ERROR_RED};
      color: ${theme.hanehldaColors.DARK_RED};
      border: 1px solid ${theme.hanehldaColors.DARK_RED};
    `}

  ${({ type }) =>
    type === "success" &&
    css`
      background-color: ${theme.colors.WHITE};
      color: ${theme.hanehldaColors.LIGHT_GREEN};
      border: 2px solid ${theme.hanehldaColors.LIGHT_GREEN};
    `}
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

export function StatusBanner() {
  const { status, setStatus } = useContext(statusBannerContext);
  return status ? (
    <BannerWrapper>
      <StyledBanner type={status.type}>
        <span>{status.node}</span>
        <button onClick={() => setStatus(null)}>
          <AiOutlineClose display="inline" />
        </button>
      </StyledBanner>
    </BannerWrapper>
  ) : null;
}
