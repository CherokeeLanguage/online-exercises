import { ReactElement, ReactNode } from "react";
import styled from "styled-components";
import { Button, ButtonVariant } from "./Button";
import { theme } from "../theme";
import { Modal } from "./Modal";

const ConfirmModalWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
`;

const ConfirmModalContent = styled.div`
  flex: 1;
`;

const ConfirmModalActions = styled.div`
  border-radius: ${theme.borderRadii.sm};
  border: "none";
  box-shadow: ${theme.boxShadow.light};
  flex: 0;
  justify-content: space-between;
  flex-direction: row-reverse;
  align-items: flex-end;
  display: inline-flex;
`;

export function ConfirmationModal({
  title,
  close,
  confirm,
  confirmContent,
  confirmVariant,
  children,
}: {
  title: string;
  close: () => void;
  confirm: () => void;
  confirmContent: ReactNode;
  confirmVariant?: ButtonVariant;
  children: ReactNode;
}): ReactElement {
  return (
    <Modal title={title} close={close} flexContent>
      <ConfirmModalWrapper>
        <ConfirmModalContent>{children}</ConfirmModalContent>
        <ConfirmModalActions>
          <Button
            variant={confirmVariant}
            onClick={() => {
              confirm();
              close();
            }}
          >
            {confirmContent}
          </Button>
        </ConfirmModalActions>
      </ConfirmModalWrapper>
    </Modal>
  );
}
