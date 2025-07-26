/**
 * Assignment function: maximize sum, one player per position, no repeats
 * Uses backtracking algorithm to find optimal player assignments for tactics
 * @param {Array} players - Array of player objects
 * @param {Array} tacticPositions - Array of position strings for the tactic
 * @returns {Object} Object with {sum, assignment} where assignment is array of {player, rating, position}
 */
export function getBestAssignment(players, tacticPositions) {
  // Build a list of (playerIdx, position, rating, playerName, playerId) for all ratings
  const n = tacticPositions.length;
  const m = players.length;
  
  // Build a matrix ratings[i][j]: rating of player i for position j (or -Infinity if not available)
  const ratings = Array.from({ length: m }, (_, i) =>
    tacticPositions.map(pos => {
      // Find the highest rating for this player for this position
      const found = players[i].allRatings.find(r => r.position === pos);
      return found ? found.rating : -Infinity;
    })
  );
  
  // Backtracking to find the best assignment (for small n, this is feasible)
  let bestSum = -Infinity;
  let bestAssignment = null;
  
  function backtrack(j = 0, used = Array(m).fill(false), curSum = 0, assignment = []) {
    if (j === n) {
      if (curSum > bestSum) {
        bestSum = curSum;
        bestAssignment = assignment.slice();
      }
      return;
    }
    
    for (let i = 0; i < m; ++i) {
      if (!used[i] && ratings[i][j] > -Infinity) {
        used[i] = true;
        assignment[j] = { 
          player: players[i], 
          rating: ratings[i][j], 
          position: tacticPositions[j] 
        };
        backtrack(j + 1, used, curSum + ratings[i][j], assignment);
        used[i] = false;
      }
    }
  }
  
  backtrack();
  return { sum: bestSum, assignment: bestAssignment };
}