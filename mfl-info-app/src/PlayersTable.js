import React, { useState, useEffect } from 'react';
import './PlayersTable.css';

const PlayersTable = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clubId, setClubId] = useState(null); // Default clubId
  const [isNextSeason, setIsNextSeason] = useState(false); // Checkbox state

  const [sortConfig, setSortConfig] = useState({ key: 'overall', direction: 'desc' });

  // Position attribute weights as percentages (from the provided table)
  const positionAttributeWeights = {
    'ST':     { passing: 0.10, shooting: 0.46, defense: 0.00, dribbling: 0.29, pace: 0.10, physical: 0.05, goalkeeping: 0.00 },
    'CF':     { passing: 0.24, shooting: 0.23, defense: 0.00, dribbling: 0.40, pace: 0.13, physical: 0.00, goalkeeping: 0.00 },
    'LW':     { passing: 0.24, shooting: 0.23, defense: 0.00, dribbling: 0.40, pace: 0.13, physical: 0.00, goalkeeping: 0.00 },
    'RW':     { passing: 0.24, shooting: 0.23, defense: 0.00, dribbling: 0.40, pace: 0.13, physical: 0.00, goalkeeping: 0.00 },
    'CAM':    { passing: 0.34, shooting: 0.21, defense: 0.00, dribbling: 0.38, pace: 0.07, physical: 0.00, goalkeeping: 0.00 },
    'CM':     { passing: 0.43, shooting: 0.12, defense: 0.10, dribbling: 0.29, pace: 0.00, physical: 0.06, goalkeeping: 0.00 },
    'LM':     { passing: 0.43, shooting: 0.12, defense: 0.10, dribbling: 0.29, pace: 0.00, physical: 0.06, goalkeeping: 0.00 },
    'RM':     { passing: 0.43, shooting: 0.12, defense: 0.10, dribbling: 0.29, pace: 0.00, physical: 0.06, goalkeeping: 0.00 },
    'CDM':    { passing: 0.28, shooting: 0.00, defense: 0.40, dribbling: 0.17, pace: 0.00, physical: 0.15, goalkeeping: 0.00 },
    'LWB':    { passing: 0.19, shooting: 0.00, defense: 0.44, dribbling: 0.17, pace: 0.10, physical: 0.10, goalkeeping: 0.00 },
    'RWB':    { passing: 0.19, shooting: 0.00, defense: 0.44, dribbling: 0.17, pace: 0.10, physical: 0.10, goalkeeping: 0.00 },
    'LB':     { passing: 0.19, shooting: 0.00, defense: 0.44, dribbling: 0.17, pace: 0.10, physical: 0.10, goalkeeping: 0.00 },
    'RB':     { passing: 0.19, shooting: 0.00, defense: 0.44, dribbling: 0.17, pace: 0.10, physical: 0.10, goalkeeping: 0.00 },
    'CB':     { passing: 0.05, shooting: 0.00, defense: 0.64, dribbling: 0.09, pace: 0.02, physical: 0.20, goalkeeping: 0.00 },
    'GK':     { passing: 0.00, shooting: 0.00, defense: 0.00, dribbling: 0.00, pace: 0.00, physical: 0.00, goalkeeping: 1.00 },
  };

  // Calculate position rating for a player and position
  // Positional familiarity matrix from the image
  const positionOrder = ['GK', 'LWB', 'LB', 'CB', 'RB', 'RWB', 'CDM', 'CM', 'RM', 'LM', 'CAM', 'RW', 'LW', 'CF', 'ST'];
  // Values: 0 = primary, 1 = secondary/third (-1), 5 = fairly familiar, 8 = somewhat familiar, 20 = unfamiliar
  const familiarityPenalty = {
    GK:   { GK: 0, CB: 20, RB: 20, LB: 20, RWB: 20, LWB: 20, CDM: 20, CM: 20, CAM: 20, RM: 20, LM: 20, RW: 20, LW: 20, CF: 20, ST: 20 },
    CB:   { GK: 20, CB: 0, RB: 8, LB: 8, RWB: 20, LWB: 20, CDM: 8, CM: 20, CAM: 20, RM: 20, LM: 20, RW: 20, LW: 20, CF: 20, ST: 20 },
    RB:   { GK: 20, CB: 8, RB: 0, LB: 8, RWB: 5, LWB: 20, CDM: 20, CM: 20, CAM: 20, RM: 8, LM: 20, RW: 20, LW: 20, CF: 20, ST: 20 },
    LB:   { GK: 20, CB: 8, RB: 8, LB: 0, RWB: 20, LWB: 5, CDM: 20, CM: 20, CAM: 20, RM: 20, LM: 8, RW: 20, LW: 20, CF: 20, ST: 20 },
    RWB:  { GK: 20, CB: 20, RB: 5, LB: 20, RWB: 0, LWB: 8, CDM: 20, CM: 20, CAM: 20, RM: 8, LM: 20, RW: 8, LW: 20, CF: 20, ST: 20 },
    LWB:  { GK: 20, CB: 20, RB: 20, LB: 5, RWB: 8, LWB: 0, CDM: 20, CM: 20, CAM: 20, RM: 20, LM: 8, RW: 20, LW: 8, CF: 20, ST: 20 },
    CDM:  { GK: 20, CB: 8, RB: 20, LB: 20, RWB: 20, LWB: 20, CDM: 0, CM: 5, CAM: 8, RM: 20, LM: 20, RW: 20, LW: 20, CF: 20, ST: 20 },
    CM:   { GK: 20, CB: 20, RB: 20, LB: 20, RWB: 20, LWB: 20, CDM: 5, CM: 0, CAM: 5, RM: 8, LM: 8, RW: 20, LW: 20, CF: 20, ST: 20 },
    CAM:  { GK: 20, CB: 20, RB: 20, LB: 20, RWB: 20, LWB: 20, CDM: 8, CM: 5, CAM: 0, RM: 20, LM: 20, RW: 20, LW: 20, CF: 5, ST: 20 },
    RM:   { GK: 20, CB: 20, RB: 8, LB: 20, RWB: 8, LWB: 20, CDM: 20, CM: 8, CAM: 20, RM: 0, LM: 8, RW: 5, LW: 20, CF: 20, ST: 20 },
    LM:   { GK: 20, CB: 20, RB: 20, LB: 8, RWB: 20, LWB: 8, CDM: 20, CM: 8, CAM: 20, RM: 8, LM: 0, RW: 20, LW: 5, CF: 20, ST: 20 },
    RW:   { GK: 20, CB: 20, RB: 20, LB: 20, RWB: 8, LWB: 20, CDM: 20, CM: 20, CAM: 20, RM: 5, LM: 20, RW: 0, LW: 8, CF: 20, ST: 20 },
    LW:   { GK: 20, CB: 20, RB: 20, LB: 20, RWB: 20, LWB: 8, CDM: 20, CM: 20, CAM: 20, RM: 20, LM: 5, RW: 8, LW: 0, CF: 20, ST: 20 },
    CF:   { GK: 20, CB: 20, RB: 20, LB: 20, RWB: 20, LWB: 20, CDM: 20, CM: 20, CAM: 5, RM: 20, LM: 20, RW: 20, LW: 20, CF: 0, ST: 5 },
    ST:   { GK: 20, CB: 20, RB: 20, LB: 20, RWB: 20, LWB: 20, CDM: 20, CM: 20, CAM: 8, RM: 20, LM: 20, RW: 20, LW: 20, CF: 5, ST: 0 },
  };

  // Calculate position rating for a player and position, given their primary position
  function calculatePositionRating(player, primaryPosition, targetPosition, isSecondary = false) {
    const weights = positionAttributeWeights[targetPosition];
    if (!weights) return null;
    let rating = 0;
    for (const [attr, weight] of Object.entries(weights)) {
      if (typeof player[attr] === 'number' || (!isNaN(Number(player[attr])) && player[attr] !== 'N/A')) {
        rating += Number(player[attr]) * weight;
      }
    }
    let penalty = 0;
    if (primaryPosition !== targetPosition) {
      if (isSecondary) {
        penalty = -1;
      } else {
        // Get penalty from familiarity matrix
        penalty = -1 * (familiarityPenalty[primaryPosition]?.[targetPosition]);
      }
    }
    return Math.round(rating + penalty);
  }

  // Return other positions that the player is familiar in
  function getOtherPositionsWithRating(player, primaryPosition, secondaryPositions) {
    const positions = Object.keys(positionAttributeWeights);
    const otherPositions = positions.filter(pos => pos !== primaryPosition && !secondaryPositions.includes(pos));
    return otherPositions.map(pos => {
      const rating = calculatePositionRating(player, primaryPosition, pos, false);
      return {position: pos, rating: rating};
    });
  }


  // Compute average overall for top N players
  function getTopNOverallAvg(players, n) {
    const sorted = players
      .filter(p => !isNaN(Number(p.overall)))
      .sort((a, b) => Number(b.overall) - Number(a.overall));
    const topN = sorted.slice(0, n);
    if (topN.length === 0) return null;
    const sum = topN.reduce((acc, p) => acc + Number(p.overall), 0);
    return (sum / topN.length).toFixed(2);
  }

  // Compute average of the max position rating for top N players
  function getTopNMaxPosRatingAvg(players, n) {
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

  const fetchPlayers = async (clubIdToFetch, isNextSeason) => {
    if (!clubIdToFetch) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // The new endpoint ignores the period param, but we keep the checkbox for UI consistency
      const hostname = 'https://z519wdyajg.execute-api.us-east-1.amazonaws.com';
      const response = await fetch(`${hostname}/prod/clubs/${clubIdToFetch}/players`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (Array.isArray(data)) {
        const transformedPlayers = data.map(player => {
          const meta = player.metadata || {};
          const positions = Array.isArray(meta.positions) ? meta.positions : [];
          const primaryPosition = positions[0];
          const primaryPositionWithRating = [{position: primaryPosition, rating: calculatePositionRating(meta, primaryPosition, primaryPosition)}];
          const secondaryPositions = positions.length > 1 ? positions.slice(1) : [];
          const secondaryPositionsWithRatings = secondaryPositions.map(pos => {
            const rating = calculatePositionRating(meta, primaryPosition, pos.trim(), true);
            return {position: pos.trim(), rating: rating};
          });
          let otherPositionsWithRatings = getOtherPositionsWithRating(meta, primaryPosition, secondaryPositions);
          // Filter out any positions with a rating that is too low (5 less than overall)
          otherPositionsWithRatings = otherPositionsWithRatings.filter(p => p.rating > Number(meta.overall) - 5);
          const allRatings = [primaryPositionWithRating, secondaryPositionsWithRatings, otherPositionsWithRatings].flat();
          return {
            id: player.id,
            name: `${meta.firstName[0] || ''}. ${meta.lastName || ''}`.trim(),
            primaryPositionWithRating,
            secondaryPositionsWithRatings,
            otherPositionsWithRatings,
            allRatings,
            overall: meta.overall ?? 'N/A',
            age: meta.age ?? 'N/A',
            pace: meta.pace ?? 'N/A',
            dribbling: meta.dribbling ?? 'N/A',
            passing: meta.passing ?? 'N/A',
            shooting: meta.shooting ?? 'N/A',
            defense: meta.defense ?? 'N/A',
            physical: meta.physical ?? 'N/A',
            goalkeeping: meta.goalkeeping ?? 'N/A',
          };
        });
        setPlayers(transformedPlayers);
      } else {
        console.warn("Fetched data structure is not as expected:", data);
        setPlayers([]);
      }
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchPlayers(clubId, isNextSeason);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchPlayers(clubId, isNextSeason);
  };

  const handleSort = (key) => {
    if (sortConfig.key === key) {
      setSortConfig({ key, direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      setSortConfig({ key, direction: 'asc' });
    }
  };

  const renderPositionWithRating = (positionWithRating) => {
    return positionWithRating.length > 0 ? positionWithRating.map(p => (
      <span key={p.position} style={{ display: 'block' }}>
        {p.position} <span style={{ color: '#1976d2', fontWeight: 500 }}>
          ({p.rating})
        </span>
      </span>
    )) : '';
  };

  // Parse tactics from tactics.txt (hardcoded here for now)
  const tacticsRaw = [
    '3-4-2-1: GK CB CB CB LM CM CM RM CF CF ST',
    '3-4-3: GK CB CB CB LM CM CM RM LW RW ST',
    '3-4-3 (diamond): GK CB CB CB CDM LM RM CAM LW RW ST',
    '3-5-2: GK CB CB CB CM CDM CM LM RM ST ST',
    '3-5-2 (B): GK CB CB CB CDM CDM LM RM CAM ST ST',
    '4-1-2-1-2: GK LB CB CB RB CDM LM RM CAM ST ST',
    '4-1-2-1-2 (narrow): GK LB CB CB RB CDM CM CM CAM ST ST',
    '4-1-3-2: GK LB CB CB RB CDM LM CM RM ST ST',
    '4-1-4-1: GK LB CB CB RB CDM LM CM CM RM ST',
    '4-2-2-2: GK LB CB CB RB CDM CDM CAM CAM ST ST',
    '4-2-3-1: GK LB CB CB RB CDM CDM LM RM CAM ST',
    '4-2-4: GK LB CB CB RB CM CM LW RW ST ST',
    '4-3-1-2: GK LB CB CB RB CM CM CM CAM ST ST',
    '4-3-2-1: GK LB CB CB RB CM CM CM CF CF ST',
    '4-3-3: GK LB CB CB RB CM CM CM LW RW ST',
    '4-3-3 (att): GK LB CB CB RB CM CM CAM LW RW ST',
    '4-3-3 (def): GK LB CB CB RB CDM CM CM LW RW ST',
    '4-3-3 (false 9): GK LB CB CB RB CDM CM CM LW RW CF',
    '4-4-1-1: GK LB CB CB RB LM CM CM RM CF ST',
    '4-4-2: GK LB CB CB RB LM CM CM RM ST ST',
    '4-4-2 (B): GK LB CB CB RB CDM CDM LM RM ST ST',
    '5-2-3: GK LWB CB CB CB RWB CM CM LW RW ST',
    '5-3-2: GK LWB CB CB CB RWB LM CM RM ST ST',
    '5-4-1: GK LWB CB CB CB RWB CDM LM RM CAM ST',
    '5-4-1 (flat): GK LWB CB CB CB RWB LM CM CM RM ST',
  ];
  const tactics = tacticsRaw.map(line => {
    const [name, posStr] = line.split(':');
    return { name: name.trim(), positions: posStr.trim().split(/\s+/) };
  });

  // Assignment function: maximize sum, one player per position, no repeats
  function getBestAssignment(players, tacticPositions) {
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
          assignment[j] = { player: players[i], rating: ratings[i][j], position: tacticPositions[j] };
          backtrack(j + 1, used, curSum + ratings[i][j], assignment);
          used[i] = false;
        }
      }
    }
    backtrack();
    return { sum: bestSum, assignment: bestAssignment };
  }


  const [activeTab, setActiveTab] = useState('players');

  return (
    <div className="players-table-container">
      <form onSubmit={handleSubmit} className="players-form">
        <label htmlFor="clubId-input">Club ID: </label>
        <input
          id="clubId-input"
          type="text"
          value={clubId}
          onChange={e => setClubId(e.target.value)}
        />
        {/* <label htmlFor="period-checkbox" className="checkbox-label">
          <input
            id="period-checkbox"
            type="checkbox"
            checked={isNextSeason}
            onChange={e => setIsNextSeason(e.target.checked)}
          />
          Next season
        </label> */}
        <button type="submit">Submit</button>
      </form>
      {loading && <div className="loading">Loading players...</div>}
      {error && <div className="error">Error fetching players: {error.message}</div>}
      {/* Tabs */}
      {
        players.length > 0 && <div className="tab-header">
        <button
          className={`tab-btn${activeTab === 'players' ? ' active' : ''}`}
          onClick={() => setActiveTab('players')}
          type="button"
        >
          Players
        </button>
        <button
          className={`tab-btn${activeTab === 'tactics' ? ' active' : ''}`}
          onClick={() => setActiveTab('tactics')}
          type="button"
        >
          Tactics
        </button>
        </div>
      }
      {
        players.length > 0 && <div className="tab-content">
          {activeTab === 'players' && (
            <table className="players-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('id')}>Player ID</th>
                  <th onClick={() => handleSort('name')}>Name</th>
                  <th onClick={() => handleSort('overall')}>Overall</th>
                  <th onClick={() => handleSort('primaryPosition')}>Primary Position</th>
                  <th onClick={() => handleSort('secondaryPositions')}>Secondary Positions</th>
                  <th onClick={() => handleSort('otherPositions')}>Other Positions</th>
                  <th onClick={() => handleSort('allPositions')}>All Positions</th>
                  <th onClick={() => handleSort('age')}>Age</th>
                  <th onClick={() => handleSort('pace')}>Pace</th>
                  <th onClick={() => handleSort('dribbling')}>Dribbling</th>
                  <th onClick={() => handleSort('passing')}>Passing</th>
                  <th onClick={() => handleSort('shooting')}>Shooting</th>
                  <th onClick={() => handleSort('defense')}>Defense</th>
                  <th onClick={() => handleSort('physical')}>Physical</th>
                  <th onClick={() => handleSort('goalkeeping')}>Goalkeeping</th>
                </tr>
              </thead>
              <tbody>
                {players.slice().sort((a, b) => {
                  let aVal = a[sortConfig.key];
                  let bVal = b[sortConfig.key];
                  // Numeric sort if possible
                  if (!isNaN(Number(aVal)) && !isNaN(Number(bVal))) {
                    aVal = Number(aVal);
                    bVal = Number(bVal);
                  } else {
                    aVal = aVal?.toString().toLowerCase() || '';
                    bVal = bVal?.toString().toLowerCase() || '';
                  }
                  if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                  if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                  return 0;
                }).map(player => (
                  <tr key={player.id}>
                    <td>
                      <a href={`https://mflplayer.info/player/${player.id}`} target="_blank" rel="noopener noreferrer">
                        {player.id}
                      </a>
                    </td>
                    <td>{player.name}</td>
                    <td>{player.overall}</td>
                    <td>
                      {renderPositionWithRating(player.primaryPositionWithRating)}
                    </td>
                    <td>
                      {renderPositionWithRating(player.secondaryPositionsWithRatings)}
                    </td>
                    <td>
                      {renderPositionWithRating(player.otherPositionsWithRatings)}
                    </td>
                    <td>
                      {renderPositionWithRating(player.allRatings)}
                    </td>
                    <td>{player.age}</td>
                    <td>{player.pace}</td>
                    <td>{player.dribbling}</td>
                    <td>{player.passing}</td>
                    <td>{player.shooting}</td>
                    <td>{player.defense}</td>
                    <td>{player.physical}</td>
                    <td>{player.goalkeeping}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {activeTab === 'tactics' && (
            <div className="tactics-section" style={{ marginTop: 0 }}>
              <h2>Optimal Lineups by Tactic</h2>
              {players && players.length >= 11 && (
                <table className="tactic-table">
                  <thead>
                    <tr>
                      <th>Tactic</th>
                      <th>Max Overall Rating</th>
                      {/* Dynamically render all positions used in any tactic */}
                      {(() => {
                        // Collect all unique positions used in any tactic (in order of first appearance)
                        const posOrder = positionOrder;
                        return posOrder.map(pos => (
                          <th key={pos}>{pos}</th>
                        ));
                      })()}
                    </tr>
                  </thead>
                  <tbody>
                    {tactics
                      .map(tactic => {
                        const { sum, assignment } = getBestAssignment(players, tactic.positions);
                        return { tactic, sum, assignment };
                      })
                      .filter(({ assignment, sum }) => assignment && assignment.length === 11 && sum !== -Infinity)
                      .sort((a, b) => b.sum - a.sum) // Sort by sum in descending order
                      .map(({ tactic, sum, assignment }) => {
                        // Map position to assigned {player, rating}
                        const posToPlayer = {};
                        assignment.forEach(({ player, rating, position }) => {
                          if (!posToPlayer[position]) posToPlayer[position] = [];
                          posToPlayer[position].push({ player, rating });
                        });
                        // Use the same posOrder as header
                        const posOrder = positionOrder;
                        return (
                          <tr key={tactic.name}>
                            <td>{tactic.name}</td>
                            <td>{sum}</td>
                            {posOrder.map(pos => (
                              <td key={pos}>
                                {posToPlayer[pos] && posToPlayer[pos].length > 0 ? (
                                  posToPlayer[pos].map(({ player, rating }) => (
                                    <span key={player.id} style={{ display: 'block' }}>{player.name} <span style={{ color: '#1976d2', fontWeight: 500 }}>({rating})</span></span>
                                  ))
                                ) : ''}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      }
      {
        players.length > 0 && <div className="averages-section">
          <div>Average Overall (Top 11): <span className="avg-value">{getTopNOverallAvg(players, 11)}</span></div>
          <div>Average Overall (Top 16): <span className="avg-value">{getTopNOverallAvg(players, 16)}</span></div>
          <div>InGame Average (Top 11): <span className="avg-value">{getTopNMaxPosRatingAvg(players, 11)}</span></div>
        </div>
      }
    </div>
  );
};

export default PlayersTable;
