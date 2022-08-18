import styled from "styled-components";
import { theme } from "../theme";

export const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 32px;
  padding: 8px;
  th,
  td {
    text-align: left;
  }

  th {
    border-bottom: 1px solid ${theme.colors.MED_GRAY};
    padding: 0 8px;
  }

  td {
    border-bottom: 1px solid ${theme.colors.LIGHT_GRAY};
    padding: 8px;
  }
  tr:nth-child(2n + 1) {
    td {
      background: ${theme.colors.LIGHTER_GRAY};
    }
  }
`;
