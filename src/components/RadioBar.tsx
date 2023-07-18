import { ReactElement, useId, useState } from "react";
import styled, { css } from "styled-components";
import { VisuallyHidden } from "./VisuallyHidden";
import { theme } from "../theme";
import { Fieldset } from "./Fieldset";

export interface RadioBarProps {
  label: string;
  value: string;
  options: {
    value: string;
    text: string;
  }[];
  onChange: (newValue: string) => void;
}

const StyledRadioBar = styled.div`
  display: flex;
  width: min-content;
  margin: 5px auto;
`;

const StyledLabel = styled.label<{
  checked: boolean;
  first: boolean;
  last: boolean;
}>`
  background-color: ${theme.colors.WHITE};
  border: 1px solid ${theme.hanehldaColors.BORDER_GRAY};
  padding: 10px;
  font-size: 20px;
  ${({ checked }) =>
    checked &&
    css`
      background-color: ${theme.hanehldaColors.DARK_BLUE};
      color: ${theme.colors.WHITE};
    `}
  ${({ first }) =>
    first &&
    css`
      border-bottom-left-radius: 10px;
      border-top-left-radius: 10px;
    `}

  ${({ last }) =>
    last &&
    css`
      border-bottom-right-radius: 10px;
      border-top-right-radius: 10px;
    `}
`;

export function RadioBar({
  label,
  options,
  value,
  onChange,
}: RadioBarProps): ReactElement {
  const id = useId();

  return (
    <Fieldset>
      <legend>{label}</legend>
      <StyledRadioBar>
        {options.map((opt, idx) => (
          <StyledLabel
            htmlFor={`${id}-item-${idx}`}
            key={idx}
            first={idx === 0}
            last={idx === options.length - 1}
            checked={value === opt.value}
          >
            {opt.text}
            <VisuallyHidden>
              <input
                name={id}
                id={`${id}-item-${idx}`}
                value={opt.value}
                checked={value === opt.value}
                type="radio"
                onChange={() => onChange(opt.value)}
              />
            </VisuallyHidden>
          </StyledLabel>
        ))}
      </StyledRadioBar>
    </Fieldset>
  );
}
