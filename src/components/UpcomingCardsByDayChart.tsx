import d3 from "d3";
import { useRef, useEffect } from "react";
import { useUserStateContext } from "../providers/UserStateProvider";
import { getToday, DAY, WEEK } from "../utils/dateUtils";

export function UpcomingCardsByDayChart() {
  const {
    leitnerBoxes: { terms },
  } = useUserStateContext();

  const today = getToday();

  function labelForDate(daysAfterToday: number) {
    if (daysAfterToday === 0) return "Today";
    if (daysAfterToday === 1) return "Tomorrow";
    else return new Date(today + daysAfterToday * DAY).toDateString();
  }

  const termsByDayThisWeek = d3.group(
    Object.values(terms)
      .filter(
        (t) =>
          // cards are up for review in the next week
          t.nextShowDate < today + WEEK &&
          // don't include new cards
          t.lastShownDate !== 0
      )
      .map((t) => ({
        ...t,
        nextShowDateString: labelForDate(
          Math.floor(Math.max(t.nextShowDate - today, 0) / DAY)
        ),
      })),
    (t) => t.nextShowDateString
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

    const maxCount = d3.max(termsByDayThisWeek.values(), (t) => t.length) ?? 0;

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
      .domain(
        [0, 1, 2, 3, 4, 5, 6].map((i) => {
          if (i === 0) return "Today";
          if (i === 1) return "Tomorrow";
          else return new Date(today + i * DAY).toDateString();
        })
      )
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
      .data(termsByDayThisWeek)
      .enter()
      .append("rect")
      .attr("x", ([date, terms], i) => xScale(date) ?? 0)
      .attr("y", ([date, terms], i) => yScale(terms.length))
      .attr("width", (d, i) => xScale.bandwidth())
      .attr(
        "height",
        ([date, terms], i) => containerDimensions.height - yScale(terms.length)
      );
  }, [chartRef.current, termsByDayThisWeek]);

  return <svg ref={chartRef} />;
}
