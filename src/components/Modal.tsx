import React, { ReactNode } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";
import { theme } from "../theme";
import { Button } from "./Button";

const ModalBackground = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.325);
`;

const StyledModal = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(80vw, 600px);
  height: min(80vh, 800px);
  background: ${theme.colors.WHITE};
  border-radius: 8px;
  padding: 8px;
  display: flex;
  flex-direction: column;
  border: 1px solid ${theme.colors.MED_GRAY};
  hr {
    border-color: ${theme.colors.MED_GRAY};
  }
`;

const ModalContent = styled.div`
  overflow-y: auto;
  height: 100%;
`;

const modalContainer = document.getElementById("modal-root");

export function Modal({
  title,
  close,
  children,
}: {
  title: string;
  close: () => void;
  children?: ReactNode;
}) {
  return createPortal(
    <>
      <ModalBackground onClick={() => close()}></ModalBackground>
      <StyledModal>
        <div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <h3 style={{ flex: 1, margin: 0 }}>{title}</h3>
            <Button style={{ flex: 0 }} onClick={() => close()}>
              Close
            </Button>
          </div>
          <hr />
        </div>
        <ModalContent>{children}</ModalContent>
      </StyledModal>
    </>,
    modalContainer!
  );
}
