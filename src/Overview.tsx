import {
  ReactElement,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
// import * as d3 from "d3";
// import { TermCardList } from "./components/TermCardList";
// import { Card, cards, keyForCard } from "./data/clean-cll-data";
// import { useLeitnerBoxContext } from "./spaced-repetition/LeitnerBoxProvider";
// import { useCardsForTerms } from "./utils/useCardsForTerms";
// import { TermCardWithStats } from "./spaced-repetition/types";

// export function Overview() {
//   const leitnerBoxes = useLeitnerBoxContext();

//   const allTerms = useMemo(
//     () => Object.keys(leitnerBoxes.state.terms),
//     [leitnerBoxes.state.terms]
//   );

//   const termCards = useCardsForTerms(cards, allTerms, keyForCard);
//   const [selectedLevel, setSelectedLevel] = useState(0);

//   const termsByBox = useMemo(
//     () =>
//       Object.entries(leitnerBoxes.state.terms)
//         .map(([term, stats]) => ({
//           term,
//           stats,
//           card: termCards[term],
//         }))
//         .reduce<TermCardWithStats<Card>[][]>(
//           (boxes, term) =>
//             boxes.map((box, boxIdx) =>
//               boxIdx === term.stats.box ? [...box, term] : box
//             ),
//           new Array(leitnerBoxes.state.numBoxes).fill(undefined).map(() => [])
//         ),
//     [leitnerBoxes.state, termCards]
//   );

//   const terms = termsByBox[selectedLevel];

//   function boxDescription(idx: number) {
//     if (idx === 0) return " (new terms)";
//     else if (idx === leitnerBoxes.state.numBoxes - 1)
//       return " (perfected terms)";
//     else return "";
//   }

//   return (
//     <div>
//       <ProgressBarChart
//         termsByBox={termsByBox.map((terms) => terms.length)}
//         selectedLevel={selectedLevel}
//       />
//       <form>
//         <label>Select level...</label>
//         <select
//           value={selectedLevel}
//           onChange={(e) => {
//             e.preventDefault();
//             setSelectedLevel(Number(e.target.value));
//           }}
//         >
//           {termsByBox.map((_, level) => (
//             <option value={level} key={level}>
//               Proficiency level {level + 1}
//               {boxDescription(level)} - {termsByBox[level].length} terms
//             </option>
//           ))}
//         </select>
//       </form>
//       <ProficiencyLevel
//         description={`Proficiency level ${selectedLevel + 1}${boxDescription(
//           selectedLevel
//         )} - ${terms.length} terms`}
//         terms={terms}
//       />
//     </div>
//   );
// }

// function ProficiencyLevel({
//   description,
//   terms,
// }: {
//   description: ReactNode;
//   terms: TermCardWithStats<Card>[];
// }) {
//   return (
//     <div>
//       <h2>{description}</h2>
//       <TermCardList cards={terms.map((t) => t.card)} />
//     </div>
//   );
// }
