import React from 'react';
import { getTopNOverallAvg, getTopNMaxPosRatingAvg } from '../utils/playerStats';

const StatsOverview = ({ players }) => {
  if (!players || players.length === 0) {
    return null;
  }

  return (
    <div className="averages-section">
      <div>Average Overall (Top 11): <span className="avg-value">{getTopNOverallAvg(players, 11)}</span></div>
      <div>Average Overall (Top 16): <span className="avg-value">{getTopNOverallAvg(players, 16)}</span></div>
      <div>InGame Average (Top 11): <span className="avg-value">{getTopNMaxPosRatingAvg(players, 11)}</span></div>
    </div>
  );
};

export default StatsOverview;