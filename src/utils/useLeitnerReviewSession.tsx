import { useEffect, useMemo, useState } from "react";
import { TermStats, UseLeitnerBoxesReturn, newTerm } from "./useLeitnerBoxes";

export interface TermCardWithStats<T> {
  card: T;
  term: string;
  stats: TermStats;
}

export interface UseLeitnerReviewSessionReturn<T> {
  current: TermCardWithStats<T>;
  next: (currentCorrect: boolean) => void;
}

function compareTerms<T>(a: TermCardWithStats<T>, b: TermCardWithStats<T>) {
  return a.stats.nextShowTime - b.stats.nextShowTime;
}

export function useLeitnerReviewSession<T>(
  leitnerBoxes: UseLeitnerBoxesReturn,
  lessonCards: Record<string, T>
) {
  // not ready until first sort has been done -- helps make sure things aren't bad
  const [ready, setReady] = useState(false);
  // cards sorted by next show time
  // keeping this cached via used state and resorting the sorted list should be much faster than useMemo
  const [sortedCards, setSortedCards] = useState<TermCardWithStats<T>[]>(() =>
    Object.entries(lessonCards)
      .map(([term, card]) => ({
        stats: leitnerBoxes.state.terms[term] ?? newTerm(term),
        term,
        card,
      }))
      .sort(compareTerms)
  );

  const [lastCardKey, setLastCardKey] = useState<string | undefined>();

  // update cards in sorted order when stats update
  // then resort from mostly sorted order
  useEffect(() => {
    // console.log("Resorting cards...");
    const newSortedCards = sortedCards
      .map(({ term }) => ({
        term,
        stats: leitnerBoxes.state.terms[term] ?? newTerm(term),
        card: lessonCards[term],
      }))
      .sort(compareTerms);
    // console.log("1st/last terms: ");
    // console.log("first", {
    //   date: new Date(newSortedCards[0].stats.nextShowTime),
    //   box: newSortedCards[0].stats.box,
    // });
    // console.log("last", {
    //   date: new Date(
    //     newSortedCards[newSortedCards.length - 1].stats.nextShowTime
    //   ),
    //   box: newSortedCards[newSortedCards.length - 1].stats.box,
    // });
    setSortedCards(newSortedCards);
    setReady(true);
  }, [leitnerBoxes.state.terms, lessonCards]);

  const currentCard = useMemo(() => {
    const topCard = sortedCards[0];
    if (topCard.term !== lastCardKey) return topCard;
    else return sortedCards[1];
  }, [sortedCards]);

  return {
    ready,
    currentCard,
    reviewCurrentCard(correct: boolean) {
      leitnerBoxes.reviewTerm(currentCard.term, correct);
      setLastCardKey(currentCard.term);
    },
  };
}
