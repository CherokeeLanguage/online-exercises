export interface TermStats {
  key: string;
  box: number;
  // timestamp rounded to days
  lastShownDate: number;
  nextShowDate: number;
}

export interface PimsleurStats extends TermStats {
  // milisecond accurate show times
  // not to be confused with TermStats.nextShowDate / lastShownDate
  nextShowTime: number;
  lastShownTime: number;
  sessionRepetitions: number;
}

export interface TermCardWithStats<T, Stats extends TermStats = TermStats> {
  card: T;
  term: string;
  stats: Stats;
}
