const PERFORMANCE_STAT_KEYS = [
  'nbMatches',
  'time',
  'goals',
  'shots',
  'shotsOnTarget',
  'shotsIntercepted',
  'dribblingSuccess',
  'assists',
  'yellowCards',
  'redCards',
  'saves',
  'goalsConceded',
  'wins',
  'draws',
  'losses',
  'foulsCommitted',
  'foulsSuffered',
  'rating',
  'xG',
  'chancesCreated',
  'passes',
  'passesAccurate',
  'crosses',
  'crossesAccurate',
  'shotsInterceptions',
  'clearances',
  'dribbledPast',
  'ownGoals',
  'defensiveDuelsWon',
  'v',
];

function toNullableNumber(value) {
  if (value === null || value === undefined) {
    return null;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
}

export function normalizePerformanceStats(stats) {
  const hasData = !!stats;
  const source = stats || {};

  const raw = PERFORMANCE_STAT_KEYS.reduce((accumulator, key) => {
    accumulator[key] = toNullableNumber(source[key]);
    return accumulator;
  }, {});

  return { hasData, raw };
}

function safeSum(values) {
  return values.reduce((sum, value) => sum + (value ?? 0), 0);
}

export function getPerformanceDerived(rawStats) {
  const raw = rawStats || {};
  const time = toNullableNumber(raw.time);
  const nbMatches = toNullableNumber(raw.nbMatches);
  const rating = toNullableNumber(raw.rating);
  const shots = toNullableNumber(raw.shots);
  const shotsOnTarget = toNullableNumber(raw.shotsOnTarget);
  const passes = toNullableNumber(raw.passes);
  const passesAccurate = toNullableNumber(raw.passesAccurate);
  const clearances = toNullableNumber(raw.clearances);
  const shotsInterceptions = toNullableNumber(raw.shotsInterceptions);
  const defensiveDuelsWon = toNullableNumber(raw.defensiveDuelsWon);
  const wins = toNullableNumber(raw.wins);
  const draws = toNullableNumber(raw.draws);
  const losses = toNullableNumber(raw.losses);

  const minutes = time === null ? null : Math.floor(time / 60);
  const avgRatingPerGame = nbMatches && nbMatches > 0 && rating !== null
    ? rating / nbMatches
    : null;
  const shotOnTargetPct = shots && shots > 0
    ? (shotsOnTarget ?? 0) / shots * 100
    : null;
  const passAccuracyPct = passes && passes > 0
    ? (passesAccurate ?? 0) / passes * 100
    : null;

  return {
    minutes,
    avgRatingPerGame,
    shotOnTargetPct,
    passAccuracyPct,
    defensiveActions: safeSum([clearances, shotsInterceptions, defensiveDuelsWon]),
    wdl: {
      wins,
      draws,
      losses,
    },
  };
}

export function buildPlayerPerformance(stats) {
  const normalized = normalizePerformanceStats(stats);
  return {
    hasData: normalized.hasData,
    raw: normalized.raw,
    derived: getPerformanceDerived(normalized.raw),
  };
}
