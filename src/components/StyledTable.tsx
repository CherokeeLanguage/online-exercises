import styled from "styled-components";
import { devices, theme } from "../theme";

export const StyledTable = styled.table`
  width: 100%;
  border-spacing: 0;
  box-sizing: border-box;
  * {
    box-sizing: border-box;
  }
  th,
  td {
    text-align: left;
  }

  th {
    padding: 0 8px;
    color: ${theme.hanehldaColors.DARK_BLUE};
  }

  td {
    padding: 8px;
    border-bottom: 1px solid ${theme.hanehldaColors.LIGHT_GRAY};
  }

  tr:nth-child(1) {
    td {
      border-top: 1px solid black;
    }
  }

  tr:last-child {
    td {
      border-bottom: 1px solid black;
    }
  }

  tr:nth-child(2n) {
    td {
      background: ${theme.hanehldaColors.CREAM};
    }
  }
  tr:nth-child(2n + 1) {
    td {
      background: ${theme.hanehldaColors.TEXT_CREAM};
    }
  }
  @media screen and (${devices.tablet}) {
    max-width: 700px;
    margin-left: auto;
    margin-right: auto;
    tr {
      td:first-child {
        border-left: 1px solid black;
      }
      td:last-child {
        border-right: 1px solid black;
      }
      :nth-child(1) {
        td:first-child {
          border-top-left-radius: 20px;
        }
        td:last-child {
          border-top-right-radius: 20px;
        }
      }
      :last-child {
        td:first-child {
          border-bottom-left-radius: 20px;
        }
        td:last-child {
          border-bottom-right-radius: 20px;
        }
      }
    }
  }
`;
