import React from 'react';
import { tactics } from '../data/tactics';
import { getBestAssignment } from '../utils/tacticsOptimizer';
import { positionOrder } from '../constants/positions';

const TacticsView = ({ players }) => {
  if (!players || players.length < 11) {
    return (
      <div className="tactics-section">
        <h2>Optimal Lineups by Tactic</h2>
        <p>Need at least 11 players to generate tactical lineups.</p>
      </div>
    );
  }

  const tacticsWithAssignments = tactics
    .map(tactic => {
      const { sum, assignment } = getBestAssignment(players, tactic.positions);
      return { tactic, sum, assignment };
    })
    .filter(({ assignment, sum }) => assignment && assignment.length === 11 && sum !== -Infinity)
    .sort((a, b) => b.sum - a.sum); // Sort by sum in descending order

  return (
    <div className="tactics-section" style={{ marginTop: 0 }}>
      <h2>Optimal Lineups by Tactic</h2>
      <table className="tactic-table">
        <thead>
          <tr>
            <th>Tactic</th>
            <th>Max Overall Rating</th>
            {positionOrder.map(pos => (
              <th key={pos}>{pos}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tacticsWithAssignments.map(({ tactic, sum, assignment }) => {
            // Map position to assigned {player, rating}
            const posToPlayer = {};
            assignment.forEach(({ player, rating, position }) => {
              if (!posToPlayer[position]) posToPlayer[position] = [];
              posToPlayer[position].push({ player, rating });
            });

            return (
              <tr key={tactic.name}>
                <td>{tactic.name}</td>
                <td>{sum}</td>
                {positionOrder.map(pos => (
                  <td key={pos}>
                    {posToPlayer[pos] && posToPlayer[pos].length > 0 ? (
                      posToPlayer[pos].map(({ player, rating }) => (
                        <span key={player.id} style={{ display: 'block' }}>
                          {player.name} <span style={{ color: '#1976d2', fontWeight: 500 }}>({rating})</span>
                        </span>
                      ))
                    ) : ''}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TacticsView;