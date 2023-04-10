import React, { ReactNode } from "react";
import styled, { css } from "styled-components";
import { BarLoader, BeatLoader } from "react-spinners/";
import { theme } from "../theme";
import { StyledHeading } from "./NavigationBar";

const StyledLoader = styled.div<{ centerInParent: boolean }>`
  text-align: center;
  ${({ centerInParent }) =>
    centerInParent &&
    css`
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    `}
`;

export function Loader({
  above,
  below,
  centerInParent = false,
}: {
  above?: ReactNode;
  below?: ReactNode;
  centerInParent?: boolean;
}) {
  return (
    <StyledLoader centerInParent={centerInParent}>
      {above}
      <p>
        <BarLoader color={theme.colors.DARK_RED} width="100%" />
      </p>
      {below ?? <p>Loading...</p>}
    </StyledLoader>
  );
}

const SmallLoaderWrapper = styled.div`
  text-align: center;
  width: 100%;
`;

export function SmallLoader({
  above,
  below,
}: {
  above?: ReactNode;
  below?: ReactNode;
}) {
  return (
    <SmallLoaderWrapper>
      <div style={{ maxWidth: 200, margin: "auto" }}>
        <StyledLoader centerInParent={false}>
          {above}
          <p>
            <BeatLoader color={theme.colors.DARK_RED} />
          </p>
          {below ?? <p>Loading...</p>}
        </StyledLoader>
      </div>
    </SmallLoaderWrapper>
  );
}

const PageLoaderWrapper = styled.div`
  text-align: center;
  position: relative;
  width: 100vw;
  height: 100vh;
`;

export function LoadingPage({ children }: { children?: ReactNode }) {
  return (
    <PageLoaderWrapper>
      <Loader
        above={<StyledHeading>Cherokee Language Exercises</StyledHeading>}
        below={children}
        centerInParent
      />
    </PageLoaderWrapper>
  );
}
