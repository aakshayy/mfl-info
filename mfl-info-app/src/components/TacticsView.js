import React from 'react';
import { tactics } from '../data/tactics';
import { getBestAssignment } from '../utils/tacticsOptimizer';
import { positionOrder } from '../constants/positions';
import { getStatColors } from '../utils/statColors';

const TacticsView = ({ players }) => {
  if (!players || players.length < 11) {
    return (
      <div className="tactics-section">
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
      <div className="table-scroll-wrapper">
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
                  <td>
                    <span
                      className="stat-badge"
                      style={{
                        color: getStatColors(sum / 11).textColor,
                        backgroundColor: getStatColors(sum / 11).backgroundColor,
                        fontWeight: 'bold'
                      }}
                    >
                      {sum}
                    </span>
                  </td>
                  {positionOrder.map(pos => (
                    <td key={pos}>
                      {posToPlayer[pos] && posToPlayer[pos].length > 0 ? (
                        posToPlayer[pos].map(({ player, rating }) => (
                          <div key={player.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.9em' }}>{player.name}</span>
                            <span
                              className="stat-badge"
                              style={{
                                color: getStatColors(rating).textColor,
                                backgroundColor: getStatColors(rating).backgroundColor,
                                fontWeight: 'bold',
                                alignSelf: 'flex-start'
                              }}
                            >
                              {rating}
                            </span>
                          </div>
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
    </div>
  );
};

export default TacticsView;
