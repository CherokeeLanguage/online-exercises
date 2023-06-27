import { ReactElement, useMemo, useState } from "react";
import styled from "styled-components";
import { alignSyllabaryAndPhonetics } from "../utils/phonetics";

const StyledAlignedCherokee = styled.div`
  mark {
    background: none;
    color: red;
    text-decoration: underline;
  }
`;

export function AlignedCherokee({
  syllabary,
  phonetics,
}: {
  syllabary: string;
  phonetics: string | undefined;
}): ReactElement {
  const [alignedSyllabaryWords, alignedPhoneticWords] = useMemo(
    () =>
      phonetics
        ? alignSyllabaryAndPhonetics(syllabary, phonetics)
        : [syllabary.split(" ").map((word) => word.split("")), []],
    [syllabary, phonetics]
  );
  const [hoveredIdx, setHoveredIdx] = useState<[number | null, number | null]>([
    null,
    null,
  ]);
  return (
    <StyledAlignedCherokee>
      <div style={{ fontSize: "1.5em" }}>
        <AlignedTextRow
          words={alignedSyllabaryWords}
          setHoveredIdx={setHoveredIdx}
          hoveredIdx={hoveredIdx}
        />
      </div>
      {phonetics && (
        <>
          <AlignedTextRow
            words={alignedPhoneticWords}
            setHoveredIdx={setHoveredIdx}
            hoveredIdx={hoveredIdx}
          />
        </>
      )}
    </StyledAlignedCherokee>
  );
}

function AlignedTextRow({
  words,
  setHoveredIdx,
  hoveredIdx: [hoveredWordIdx, hoveredSegmentIdx],
}: {
  words: string[][];
  hoveredIdx: [number | null, number | null];
  setHoveredIdx: (idx: [number | null, number | null]) => void;
}) {
  return (
    <p>
      {words.map((word, wordIdx) => (
        <>
          {wordIdx === 0 ? "" : " "}
          {word.map((segment, segmentIdx) => (
            <span
              onMouseOver={() => setHoveredIdx([wordIdx, segmentIdx])}
              onMouseOut={() => setHoveredIdx([null, null])}
            >
              {hoveredWordIdx === wordIdx &&
              hoveredSegmentIdx === segmentIdx ? (
                <mark>{segment}</mark>
              ) : (
                segment
              )}
            </span>
          ))}
        </>
      ))}
    </p>
  );
}
