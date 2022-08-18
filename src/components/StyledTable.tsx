import styled from "styled-components";
import { theme } from "../theme";

export const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  th {
    text-align: left;
  }
  td {
    border-bottom: 1px solid ${theme.colors.LIGHT_GRAY};
    text-align: left;
  }
  tr:nth-child(2n + 1) {
    td {
      background: ${theme.colors.LIGHTER_GRAY};
    }
  }
`;
