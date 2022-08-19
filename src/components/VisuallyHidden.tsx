import styled from "styled-components";

export const VisuallyHidden = styled.div`
  /* Contain text within 1px box */
  height: 1px;
  overflow: hidden;
  width: 1px; /* Keep the layout */
  position: absolute; /* Remove any visible trace (e.g. background color) */
  clip: rect(1px 1px 1px 1px); /* IE6, IE7 */
  clip: rect(1px, 1px, 1px, 1px);
  clip-path: inset(
    50%
  ); /* browsers in the future */ /* Prevent the screen reader to skip spaces between words */
  white-space: nowrap;
`;
