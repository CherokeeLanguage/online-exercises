import { ReactNode, ReactElement, useRef } from "react";
import styled from "styled-components";
import { theme } from "../../theme";

const StyledPage = styled.div`
  height: 100dvh;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  background-color: ${theme.hanehldaColors.CREAM};
`;

export function Page({ children }: { children: ReactNode }): ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  function scrollTop() {
    if (ref.current) {
      // ref.current.scrollTo({ top: 0 });
      ref.current.scrollIntoView();
      // window.alert("scrolling! scroll top:" + document.body.scrollTop);
    }
  }
  return (
    <StyledPage ref={ref} onBlur={scrollTop} onFocus={scrollTop}>
      {children}
    </StyledPage>
  );
}

export const ScrollWrapper = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
  height: 100%;
  overflow-x: auto;
`;

export const PageContent = styled.div`
  position: relative;
  flex: 1;
  /* max-width: min(800px, 100vw); */
  margin: 0 auto;
  text-align: center;
  display: grid;
  grid-template-rows: auto auto min(1fr, 300px);
`;
