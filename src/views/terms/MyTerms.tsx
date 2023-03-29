import { ReactElement, useMemo, useState } from "react";
import { CardTable } from "../../components/CardTable";
import { SectionHeading } from "../../components/SectionHeading";
import {
  PROFICIENCY_LEVELS,
  TermsByProficiencyLevelChart,
} from "../../components/TermsByProficiencyLevelChart";
import { cards, keyForCard } from "../../data/cards";
import { useAnalyticsPageName } from "../../firebase/hooks";
import { useUserStateContext } from "../../providers/UserStateProvider";
import { useCardsForTerms } from "../../utils/useCardsForTerms";

export function MyTerms(): ReactElement {
  useAnalyticsPageName("My terms");
  const {
    leitnerBoxes: { terms },
  } = useUserStateContext();
  const [selectedBar, setSelectedBar] = useState<number | null>(null);

  const selectedTerms = useMemo(
    () =>
      selectedBar === undefined
        ? []
        : Object.values(terms)
            .filter((t) => t.box === selectedBar)
            .map((t) => t.key),
    [terms, selectedBar]
  );

  const cardsForSelectedTerms = useCardsForTerms(
    cards,
    selectedTerms,
    keyForCard
  );

  return (
    <div>
      <TermsByProficiencyLevelChart
        onBarClick={(box) => setSelectedBar(box)}
        selectedBar={selectedBar}
      />
      {selectedBar === null ? (
        <p>Click on a bar to view terms in a given proficiency level</p>
      ) : (
        <>
          <SectionHeading>
            {PROFICIENCY_LEVELS[selectedBar]} - terms
          </SectionHeading>
          <hr></hr>
          <CardTable cards={Object.values(cardsForSelectedTerms)} />
        </>
      )}
    </div>
  );
}
