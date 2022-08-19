import * as d3 from "d3";
import { useRef, useEffect } from "react";
import { useUserStateContext } from "../state/UserStateProvider";
import { theme } from "../theme";

export const PROFICIENCY_LEVELS = [
  "New",
  "Review every day",
  "Review every three days",
  "Review every week",
  "Review every two weeks",
  "Mastered",
] as const;

const BAR_COLORS: Record<typeof PROFICIENCY_LEVELS[number], string> = {
  New: theme.colors.MED_GREEN,
  "Review every day": theme.colors.LIGHT_GRAY,
  "Review every three days": theme.colors.DARK_RED,
  "Review every week": theme.colors.SOFT_YELLOW,
  "Review every two weeks": theme.colors.MED_GRAY,
  Mastered: theme.colors.DARK_GREEN,
};

export function TermsByProficiencyLevelChart({
  selectedBar,
  onBarClick,
}: {
  selectedBar: number | null;
  onBarClick: (box: number) => void;
}) {
  const {
    leitnerBoxes: { terms },
  } = useUserStateContext();

  function labelForBox(box: number) {
    return PROFICIENCY_LEVELS[box];
  }

  const termsByBox = d3.group(
    Object.values(terms).map((t) => ({
      ...t,
      label: labelForBox(t.box),
    })),
    (t) => t.label
  );

  const chartRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (chartRef.current === null) return;
    const dimensions = {
      width: 800,
      height: 400,
      margins: 40,
    };

    const containerDimensions = {
      width: dimensions.width - dimensions.margins * 2,
      height: dimensions.height - dimensions.margins * 2,
    };

    const maxCount = d3.max(termsByBox.values(), (t) => t.length) ?? 0;

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
      .domain(PROFICIENCY_LEVELS)
      .range([0, containerDimensions.width])
      .padding(0.4);

    const yScale = d3
      .scaleLinear()
      .domain([0, maxCount])
      .range([containerDimensions.height - 10, 0]);

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
      .attr("fill", ([label, terms], i) => BAR_COLORS[label])
      .attr("x", ([label, terms], i) => xScale(label) ?? 0)
      .attr("y", ([label, terms], i) => yScale(terms.length))
      .attr("width", (d, i) => xScale.bandwidth())
      .attr(
        "height",
        ([label, terms], i) => containerDimensions.height - yScale(terms.length)
      )
      .on("click", (i, [label, terms]) =>
        onBarClick(PROFICIENCY_LEVELS.indexOf(label))
      );
  }, [chartRef.current, termsByBox]);

  return <svg ref={chartRef} />;
}
