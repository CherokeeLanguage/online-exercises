import { ReactElement, ReactNode } from "react";
import styled from "styled-components";
import { Button } from "./Button";
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
  border-radius: 8px;
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
  children,
}: {
  title: string;
  close: () => void;
  confirm: () => void;
  confirmContent: ReactNode;
  children: ReactNode;
}): ReactElement {
  return (
    <Modal title={title} close={close} flexContent>
      <ConfirmModalWrapper>
        <ConfirmModalContent>{children}</ConfirmModalContent>
        <ConfirmModalActions>
          <Button
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
