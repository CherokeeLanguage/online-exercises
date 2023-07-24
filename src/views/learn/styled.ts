import styled from "styled-components";
import { theme } from "../../theme";

export const ContentWrapper = styled.div`
  padding: 20px;
`;

export const Widget = styled.div<{ maxWidth: number; background: string }>`
  max-width: ${(p) => p.maxWidth}px;
  background-color: ${(p) => p.background};
  color: ${theme.colors.WHITE};
  border: 1px solid black;
  border-radius: ${theme.borderRadii.md};
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
  margin: 0 auto 30px;
  padding: 16px;
`;

export const WidgetTitle = styled.h2`
  font-weight: bold;
  font-size: ${theme.fontSizes.md};
  margin: 0;
  margin-bottom: 10px;
`;

export const WidgetButton = styled.button`
  display: block;
  background-color: ${theme.colors.WHITE};
  border: none;
  border-radius: ${theme.borderRadii.md};
  padding: 10px;
  min-height: 60px;
  width: 100%;
  max-width: 300px;
  color: ${theme.hanehldaColors.DARK_GRAY};
  margin: 0 auto;
`;
