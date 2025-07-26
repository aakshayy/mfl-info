/**
 * Compute average overall for top N players
 * @param {Array} players - Array of player objects
 * @param {number} n - Number of top players to consider
 * @returns {string|null} Average overall rating formatted to 2 decimal places
 */
export function getTopNOverallAvg(players, n) {
  const sorted = players
    .filter(p => !isNaN(Number(p.overall)))
    .sort((a, b) => Number(b.overall) - Number(a.overall));
  const topN = sorted.slice(0, n);
  if (topN.length === 0) return null;
  const sum = topN.reduce((acc, p) => acc + Number(p.overall), 0);
  return (sum / topN.length).toFixed(2);
}

/**
 * Compute average of the max position rating for top N players
 * @param {Array} players - Array of player objects
 * @param {number} n - Number of top players to consider
 * @returns {string|null} Average max position rating formatted to 2 decimal places
 */
export function getTopNMaxPosRatingAvg(players, n) {
  const maxRatings = players.map(p => {
    const ratings = [];
    if (Array.isArray(p.allRatings)) ratings.push(...p.allRatings.map(sp => sp.rating));
    return ratings.length > 0 ? Math.max(...ratings) : null;
  }).filter(r => r !== null && !isNaN(r));
  
  const sorted = maxRatings.sort((a, b) => b - a).slice(0, n);
  if (sorted.length === 0) return null;
  const sum = sorted.reduce((acc, r) => acc + r, 0);
  return (sum / sorted.length).toFixed(2);
}