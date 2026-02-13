import React, { useState } from 'react';
import { getStatColors } from '../utils/statColors';

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
    return positionWithRating.length > 0 ? positionWithRating.map(p => {
      const colors = getStatColors(p.rating);
      return (
        <div key={p.position} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ minWidth: '32px', fontSize: '0.85em', color: '#9f9f9f' }}>{p.position}</span>
          <span 
            className="stat-badge"
            style={{ 
              color: colors.textColor, 
              backgroundColor: colors.backgroundColor,
              fontWeight: 'bold'
            }}
          >
            {p.rating}
          </span>
        </div>
      );
    }) : '';
  };

  const getSortValue = (player, key) => {
    switch (key) {
      case 'allPositions':
        // Sort by highest position rating
        const allRatings = player.allRatings?.map(r => r.rating).filter(r => !isNaN(r)) || [];
        return allRatings.length > 0 ? Math.max(...allRatings) : 0;
      case 'primaryPosition':
        return player.primaryPositionWithRating?.[0]?.rating || 0;
      case 'secondaryPositions':
        const secRatings = player.secondaryPositionsWithRatings?.map(r => r.rating).filter(r => !isNaN(r)) || [];
        return secRatings.length > 0 ? Math.max(...secRatings) : 0;
      case 'otherPositions':
        const otherRatings = player.otherPositionsWithRatings?.map(r => r.rating).filter(r => !isNaN(r)) || [];
        return otherRatings.length > 0 ? Math.max(...otherRatings) : 0;
      default:
        return player[key];
    }
  };

  const sortedPlayers = players.slice().sort((a, b) => {
    let aVal = getSortValue(a, sortConfig.key);
    let bVal = getSortValue(b, sortConfig.key);
    
    // Handle N/A values
    if (aVal === 'N/A' && bVal === 'N/A') return 0;
    if (aVal === 'N/A') return sortConfig.direction === 'asc' ? 1 : -1;
    if (bVal === 'N/A') return sortConfig.direction === 'asc' ? -1 : 1;
    
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

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <span className="sort-icon">⇵</span>;
    }
    return sortConfig.direction === 'asc' ? 
      <span className="sort-icon active">↑</span> : 
      <span className="sort-icon active">↓</span>;
  };

  return (
    <div className="table-scroll-wrapper">
      <table className="players-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('id')} className="sortable">
              Player ID {getSortIcon('id')}
            </th>
            <th onClick={() => handleSort('name')} className="sortable">
              Name {getSortIcon('name')}
            </th>
            <th onClick={() => handleSort('overall')} className="sortable">
              Overall {getSortIcon('overall')}
            </th>
            <th onClick={() => handleSort('allPositions')} className="sortable">
              All Positions {getSortIcon('allPositions')}
            </th>
            <th onClick={() => handleSort('age')} className="sortable">
              Age {getSortIcon('age')}
            </th>
            <th onClick={() => handleSort('pace')} className="sortable">
              Pace {getSortIcon('pace')}
            </th>
            <th onClick={() => handleSort('dribbling')} className="sortable">
              Dribbling {getSortIcon('dribbling')}
            </th>
            <th onClick={() => handleSort('passing')} className="sortable">
              Passing {getSortIcon('passing')}
            </th>
            <th onClick={() => handleSort('shooting')} className="sortable">
              Shooting {getSortIcon('shooting')}
            </th>
            <th onClick={() => handleSort('defense')} className="sortable">
              Defense {getSortIcon('defense')}
            </th>
            <th onClick={() => handleSort('physical')} className="sortable">
              Physical {getSortIcon('physical')}
            </th>
            <th onClick={() => handleSort('goalkeeping')} className="sortable">
              Goalkeeping {getSortIcon('goalkeeping')}
            </th>
            <th onClick={() => handleSort('primaryPosition')} className="sortable">
              Primary Position {getSortIcon('primaryPosition')}
            </th>
            <th onClick={() => handleSort('secondaryPositions')} className="sortable">
              Secondary Positions {getSortIcon('secondaryPositions')}
            </th>
            <th onClick={() => handleSort('otherPositions')} className="sortable">
              Other Positions {getSortIcon('otherPositions')}
            </th>
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
              <td>
                <span
                  className="stat-badge"
                  style={{
                    color: getStatColors(player.overall).textColor,
                    backgroundColor: getStatColors(player.overall).backgroundColor,
                    fontWeight: 'bold'
                  }}
                >
                  {player.overall}
                </span>
              </td>
              <td>
                {renderPositionWithRating(player.allRatings)}
              </td>
              <td>{player.age}</td>
              <td>
                <span
                  className="stat-badge"
                  style={{
                    color: getStatColors(player.pace).textColor,
                    backgroundColor: getStatColors(player.pace).backgroundColor,
                    fontWeight: 'bold'
                  }}
                >
                  {player.pace}
                </span>
              </td>
              <td>
                <span
                  className="stat-badge"
                  style={{
                    color: getStatColors(player.dribbling).textColor,
                    backgroundColor: getStatColors(player.dribbling).backgroundColor,
                    fontWeight: 'bold'
                  }}
                >
                  {player.dribbling}
                </span>
              </td>
              <td>
                <span
                  className="stat-badge"
                  style={{
                    color: getStatColors(player.passing).textColor,
                    backgroundColor: getStatColors(player.passing).backgroundColor,
                    fontWeight: 'bold'
                  }}
                >
                  {player.passing}
                </span>
              </td>
              <td>
                <span
                  className="stat-badge"
                  style={{
                    color: getStatColors(player.shooting).textColor,
                    backgroundColor: getStatColors(player.shooting).backgroundColor,
                    fontWeight: 'bold'
                  }}
                >
                  {player.shooting}
                </span>
              </td>
              <td>
                <span
                  className="stat-badge"
                  style={{
                    color: getStatColors(player.defense).textColor,
                    backgroundColor: getStatColors(player.defense).backgroundColor,
                    fontWeight: 'bold'
                  }}
                >
                  {player.defense}
                </span>
              </td>
              <td>
                <span
                  className="stat-badge"
                  style={{
                    color: getStatColors(player.physical).textColor,
                    backgroundColor: getStatColors(player.physical).backgroundColor,
                    fontWeight: 'bold'
                  }}
                >
                  {player.physical}
                </span>
              </td>
              <td>
                <span
                  className="stat-badge"
                  style={{
                    color: getStatColors(player.goalkeeping).textColor,
                    backgroundColor: getStatColors(player.goalkeeping).backgroundColor,
                    fontWeight: 'bold'
                  }}
                >
                  {player.goalkeeping}
                </span>
              </td>
              <td>
                {renderPositionWithRating(player.primaryPositionWithRating)}
              </td>
              <td>
                {renderPositionWithRating(player.secondaryPositionsWithRatings)}
              </td>
              <td>
                {renderPositionWithRating(player.otherPositionsWithRatings)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlayersTableView;
