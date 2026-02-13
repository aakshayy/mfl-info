import { getPerformanceDerived, normalizePerformanceStats } from './playerPerformance';

describe('playerPerformance utilities', () => {
  test('normalizePerformanceStats returns hasData false and null raw values for missing stats', () => {
    const normalized = normalizePerformanceStats(null);

    expect(normalized.hasData).toBe(false);
    expect(normalized.raw.nbMatches).toBeNull();
    expect(normalized.raw.rating).toBeNull();
    expect(normalized.raw.passes).toBeNull();
  });

  test('getPerformanceDerived handles zero divisors and computes defensive actions', () => {
    const derived = getPerformanceDerived({
      nbMatches: 7,
      rating: 84,
      time: 37800,
      shots: 0,
      shotsOnTarget: 0,
      passes: 0,
      passesAccurate: 0,
      clearances: 39,
      shotsInterceptions: 5,
      defensiveDuelsWon: 7,
      wins: 2,
      draws: 1,
      losses: 4,
    });

    expect(derived.minutes).toBe(630);
    expect(derived.avgRatingPerGame).toBe(12);
    expect(derived.shotOnTargetPct).toBeNull();
    expect(derived.passAccuracyPct).toBeNull();
    expect(derived.defensiveActions).toBe(51);
    expect(derived.wdl).toEqual({ wins: 2, draws: 1, losses: 4 });
  });

  test('getPerformanceDerived computes percentages when attempts are present', () => {
    const derived = getPerformanceDerived({
      nbMatches: 0,
      rating: 50,
      shots: 10,
      shotsOnTarget: 3,
      passes: 200,
      passesAccurate: 150,
      clearances: 0,
      shotsInterceptions: 0,
      defensiveDuelsWon: 0,
      wins: 1,
      draws: 0,
      losses: 0,
    });

    expect(derived.avgRatingPerGame).toBeNull();
    expect(derived.shotOnTargetPct).toBeCloseTo(30);
    expect(derived.passAccuracyPct).toBeCloseTo(75);
  });
});
