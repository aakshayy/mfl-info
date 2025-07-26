import React, { useState } from 'react';

const PlayersTableView = ({ players }) => {
  const [sortConfig, setSortConfig] = useState({ key: 'overall', direction: 'desc' });

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

  const sortedPlayers = players.slice().sort((a, b) => {
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
  });

  return (
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
        {sortedPlayers.map(player => (
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
  );
};

export default PlayersTableView;