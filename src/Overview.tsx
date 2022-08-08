import {
  ReactElement,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as d3 from "d3";
import { TermCardList } from "./components/TermCardList";
import { Card, cards, keyForCard } from "./data/clean-cll-data";
import { useLeitnerBoxContext } from "./utils/LeitnerBoxProvider";
import { useCardsForTerms } from "./utils/useCardsForTerms";
import { TermCardWithStats } from "./utils/useLeitnerReviewSession";

export function Overview() {
  const leitnerBoxes = useLeitnerBoxContext();

  const allTerms = useMemo(
    () => Object.keys(leitnerBoxes.state.terms),
    [leitnerBoxes.state.terms]
  );

  const termCards = useCardsForTerms(cards, allTerms, keyForCard);
  const [selectedLevel, setSelectedLevel] = useState(0);

  const termsByBox = useMemo(
    () =>
      Object.entries(leitnerBoxes.state.terms)
        .map(([term, stats]) => ({
          term,
          stats,
          card: termCards[term],
        }))
        .reduce<TermCardWithStats<Card>[][]>(
          (boxes, term) =>
            boxes.map((box, boxIdx) =>
              boxIdx === term.stats.box ? [...box, term] : box
            ),
          new Array(leitnerBoxes.state.numBoxes).fill(undefined).map(() => [])
        ),
    [leitnerBoxes.state, termCards]
  );

  const terms = termsByBox[selectedLevel];

  function boxDescription(idx: number) {
    if (idx === 0) return " (new terms)";
    else if (idx === leitnerBoxes.state.numBoxes - 1)
      return " (perfected terms)";
    else return "";
  }

  return (
    <div>
      <ProgressBarChart
        termsByBox={termsByBox.map((terms) => terms.length)}
        selectedLevel={selectedLevel}
      />
      <form>
        <label>Select level...</label>
        <select
          value={selectedLevel}
          onChange={(e) => {
            e.preventDefault();
            setSelectedLevel(Number(e.target.value));
          }}
        >
          {termsByBox.map((_, level) => (
            <option value={level} key={level}>
              Proficiency level {level + 1}
              {boxDescription(level)} - {termsByBox[level].length} terms
            </option>
          ))}
        </select>
      </form>
      <ProficiencyLevel
        description={`Proficiency level ${selectedLevel + 1}${boxDescription(
          selectedLevel
        )} - ${terms.length} terms`}
        terms={terms}
      />
    </div>
  );
}

function ProficiencyLevel({
  description,
  terms,
}: {
  description: ReactNode;
  terms: TermCardWithStats<Card>[];
}) {
  return (
    <div>
      <h2>{description}</h2>
      <TermCardList terms={terms} />
    </div>
  );
}

function ProgressBarChart({
  termsByBox,
  selectedLevel,
}: {
  termsByBox: number[];
  selectedLevel: number;
}): ReactElement {
  const chartRef = useRef<SVGSVGElement | null>(null);
  const data = useMemo(
    () =>
      termsByBox.map((count, idx) => ({
        name: `${idx + 1}`,
        count,
      })),
    [termsByBox]
  );

  useEffect(() => {
    if (chartRef.current === null) return;
    const numBars = termsByBox.length;
    // bars are "10" wide with "5" padding
    const barWidth = 20;
    const dimensions = {
      width: 2 * numBars * barWidth,
      height: 400,
      margins: 40,
    };

    const containerDimensions = {
      width: dimensions.width - dimensions.margins * 2,
      height: dimensions.height - dimensions.margins * 2,
    };

    const maxCount = Math.max(...termsByBox);

    const svg = d3
      .select(chartRef.current)
      .classed("line-chart", true)
      .attr("width", dimensions.width)
      .attr("height", dimensions.height);

    console.log({ svg });

    // clear chart
    svg.selectAll("*").remove();

    const container = svg
      .append("g")
      .classed("container", true)
      .attr(
        "transform",
        `translate(${dimensions.margins}, ${dimensions.margins})`
      );

    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.name))
      .range([0, containerDimensions.width])
      .padding(0.4);
    const yScale = d3
      .scaleLinear()
      .domain([0, maxCount])
      .range([containerDimensions.height - xScale.bandwidth(), 0]);

    container
      .append("g")
      .attr("transform", "translate(0," + containerDimensions.height + ")")
      .call(d3.axisBottom(xScale));

    container
      .append("g")
      .call(
        d3
          .axisLeft(yScale)
          .tickFormat(function (d) {
            return `${d}`;
          })
          .ticks(10)
      )
      .append("text")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("value");

    container
      .selectAll(".bar")
      .data(termsByBox)
      .enter()
      .append("rect")
      .attr("x", (d, i) => xScale(`${i + 1}`) ?? 0)
      .attr("y", (d, i) => yScale(d))
      .attr("width", (d, i) => xScale.bandwidth())
      .attr("height", (d, i) => containerDimensions.height - yScale(d));
  }, [chartRef.current, termsByBox]);

  // {
  //   termsByBox.map((count, idx) => {
  //     const barHeight =
  //       zeroBarHeight + Math.round((count / maxCount) * maxBarHeight);

  //     const barX = (idx + 0.5) * barWidth * 2;
  //     const barY = maxHeight - barHeight;
  //     return (
  //       <>
  //         <rect
  //           style={{ fill: selectedLevel === idx ? "#f32" : "#999" }}
  //           x={barX}
  //           y={barY}
  //           width={barWidth}
  //           height={barHeight}
  //         ></rect>
  //         <text
  //           x={barX + barWidth / 2}
  //           y={maxHeight - zeroBarHeight}
  //           textAnchor="middle"
  //         >
  //           {count}
  //         </text>
  //       </>
  //     );
  //   });
  // }

  return <svg ref={chartRef} />;
}
