import React, { ReactNode } from "react";
import { createPortal } from "react-dom";
import styled, { css } from "styled-components";
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
  max-width: min(80vw, 600px);
  min-width: 300px;
  /* min-height: min(80vh, 300px); */
  max-height: 80vh;
  background: ${theme.colors.WHITE};
  border-radius: 20px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  border: 1px solid ${theme.colors.MED_GRAY};
  hr {
    border-color: ${theme.colors.MED_GRAY};
  }
`;

const ModalContent = styled.div<{ flex: boolean }>`
  overflow-y: auto;
  flex: 1;
  height: 100%;
  ${({ flex }) =>
    flex &&
    css`
      display: flex;
    `};
`;

const modalContainer = document.getElementById("modal-root");

export function Modal({
  title,
  close,
  children,
  flexContent = false,
}: {
  title: string;
  close?: () => void;
  children?: ReactNode;
  flexContent?: boolean;
}) {
  return createPortal(
    <>
      <ModalBackground onClick={() => close?.()}></ModalBackground>
      <StyledModal>
        <div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <h3 style={{ flex: 1, margin: 0 }}>{title}</h3>
            {close && (
              <Button
                style={{ flex: 0 }}
                onClick={() => close()}
                variant="negative"
              >
                Close
              </Button>
            )}
          </div>
          <hr />
        </div>
        <ModalContent flex={flexContent}>{children}</ModalContent>
      </StyledModal>
    </>,
    modalContainer!
  );
}
