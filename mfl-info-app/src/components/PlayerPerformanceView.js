import React, { useMemo, useState } from 'react';
import { getStatColors } from '../utils/statColors';

const DEFAULT_SORT = { key: 'rating', direction: 'desc' };
const POSITION_GROUP_ORDER = ['Attackers', 'Midfielders', 'Defenders', 'Goalkeepers'];
const POSITION_GROUPS = {
  Attackers: new Set(['FW', 'ST', 'CF', 'RW', 'LW', 'RF', 'LF']),
  Midfielders: new Set(['AM', 'CAM', 'CM', 'CDM', 'RM', 'LM']),
  Defenders: new Set(['CB', 'LB', 'RB', 'LWB', 'RWB']),
  Goalkeepers: new Set(['GK']),
};

const PlayerPerformanceView = ({ players }) => {
  const [sortConfig, setSortConfig] = useState(DEFAULT_SORT);

  const handleSort = (key) => {
    if (sortConfig.key === key) {
      setSortConfig({
        key,
        direction: sortConfig.direction === 'asc' ? 'desc' : 'asc',
      });
      return;
    }

    setSortConfig({ key, direction: 'asc' });
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <span className="sort-icon">&lt;&gt;</span>;
    }

    return sortConfig.direction === 'asc'
      ? <span className="sort-icon active">^</span>
      : <span className="sort-icon active">v</span>;
  };

  const compareValues = (aValue, bValue, direction) => {
    const isANull = aValue === null || aValue === undefined;
    const isBNull = bValue === null || bValue === undefined;

    if (isANull && isBNull) {
      return 0;
    }
    if (isANull) {
      return 1;
    }
    if (isBNull) {
      return -1;
    }

    const numericA = Number(aValue);
    const numericB = Number(bValue);
    const canUseNumericCompare = Number.isFinite(numericA) && Number.isFinite(numericB);

    if (canUseNumericCompare) {
      if (numericA < numericB) {
        return direction === 'asc' ? -1 : 1;
      }
      if (numericA > numericB) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    }

    const normalizedA = String(aValue).toLowerCase();
    const normalizedB = String(bValue).toLowerCase();
    if (normalizedA < normalizedB) {
      return direction === 'asc' ? -1 : 1;
    }
    if (normalizedA > normalizedB) {
      return direction === 'asc' ? 1 : -1;
    }
    return 0;
  };

  const getPerformance = (player) => player.performance || {
    hasData: false,
    raw: {},
    derived: { wdl: {} },
  };

  const getSortValue = (player, key) => {
    const performance = getPerformance(player);
    if (!performance.hasData) {
      if (key === 'id' || key === 'name' || key === 'primaryPosition') {
        if (key === 'primaryPosition') {
          return player.primaryPositionWithRating?.[0]?.position || null;
        }
        return player[key];
      }
      return null;
    }

    switch (key) {
      case 'primaryPosition':
        return player.primaryPositionWithRating?.[0]?.position || null;
      case 'matches':
        return performance.raw.nbMatches;
      case 'minutes':
        return performance.derived.minutes;
      case 'rating':
        return performance.derived.avgRatingPerGame;
      case 'goals':
        return performance.raw.goals;
      case 'assists':
        return performance.raw.assists;
      case 'xG':
        return performance.raw.xG;
      case 'shots':
        return performance.raw.shots;
      case 'sotPct':
        return performance.derived.shotOnTargetPct;
      case 'passPct':
        return performance.derived.passAccuracyPct;
      case 'chances':
        return performance.raw.chancesCreated;
      case 'defActions':
        return performance.derived.defensiveActions;
      case 'wdl':
        return performance.derived.wdl;
      default:
        return player[key];
    }
  };

  const sortedPlayers = useMemo(() => {
    const playersWithMatches = players.filter((player) => {
      const performance = getPerformance(player);
      return performance.hasData && (performance.raw.nbMatches ?? 0) > 0;
    });

    return playersWithMatches.slice().sort((a, b) => {
      const aSortValue = getSortValue(a, sortConfig.key);
      const bSortValue = getSortValue(b, sortConfig.key);

      if (sortConfig.key === 'wdl') {
        const getWinPct = (wdlValue) => {
          if (!wdlValue) {
            return null;
          }
          const wins = wdlValue.wins ?? 0;
          const draws = wdlValue.draws ?? 0;
          const losses = wdlValue.losses ?? 0;
          const total = wins + draws + losses;
          return total > 0 ? (wins / total) * 100 : null;
        };

        const winPctCompare = compareValues(getWinPct(aSortValue), getWinPct(bSortValue), sortConfig.direction);
        if (winPctCompare !== 0) {
          return winPctCompare;
        }

        const aGoalsContributions = a.performance?.hasData
          ? (a.performance.raw.goals ?? 0) + (a.performance.raw.assists ?? 0)
          : null;
        const bGoalsContributions = b.performance?.hasData
          ? (b.performance.raw.goals ?? 0) + (b.performance.raw.assists ?? 0)
          : null;
        return compareValues(aGoalsContributions, bGoalsContributions, sortConfig.direction);
      }

      return compareValues(aSortValue, bSortValue, sortConfig.direction);
    });
  }, [players, sortConfig]);

  const formatNumber = (value, digits = 0) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return 'N/A';
    }
    return Number(value).toFixed(digits);
  };

  const formatPercent = (value) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return 'N/A';
    }
    return `${Number(value).toFixed(1)}%`;
  };

  const formatWdl = (wdl, hasData) => {
    if (!hasData || !wdl) {
      return 'N/A';
    }
    const wins = wdl.wins ?? 0;
    const draws = wdl.draws ?? 0;
    const losses = wdl.losses ?? 0;
    const total = wins + draws + losses;
    const winPct = total > 0 ? `${((wins / total) * 100).toFixed(1)}%` : 'N/A';
    return `${wins}-${draws}-${losses} (${winPct})`;
  };

  const getPositionGroup = (player) => {
    const primaryPosition = player.primaryPositionWithRating?.[0]?.position;
    if (!primaryPosition) {
      return 'Midfielders';
    }

    for (const groupName of POSITION_GROUP_ORDER) {
      if (POSITION_GROUPS[groupName].has(primaryPosition)) {
        return groupName;
      }
    }

    return 'Midfielders';
  };

  const groupedPlayers = useMemo(() => {
    const grouped = POSITION_GROUP_ORDER.reduce((acc, group) => ({ ...acc, [group]: [] }), {});
    sortedPlayers.forEach((player) => {
      grouped[getPositionGroup(player)].push(player);
    });
    return grouped;
  }, [sortedPlayers]);

  const getSectionAverages = (playersInGroup) => {
    const performances = playersInGroup
      .map((player) => getPerformance(player))
      .filter((performance) => performance.hasData);

    if (!performances.length) {
      return null;
    }

    const averageOf = (extractValue) => {
      const values = performances
        .map(extractValue)
        .filter((value) => value !== null && value !== undefined && Number.isFinite(Number(value)))
        .map(Number);
      if (!values.length) {
        return null;
      }
      return values.reduce((sum, value) => sum + value, 0) / values.length;
    };

    const sumOf = (extractValue) => performances.reduce((sum, performance) => sum + (Number(extractValue(performance)) || 0), 0);

    const totalShots = sumOf((performance) => performance.raw.shots);
    const totalShotsOnTarget = sumOf((performance) => performance.raw.shotsOnTarget);
    const totalPasses = sumOf((performance) => performance.raw.passes);
    const totalPassesAccurate = sumOf((performance) => performance.raw.passesAccurate);
    const totalWins = sumOf((performance) => performance.derived.wdl?.wins);
    const totalDraws = sumOf((performance) => performance.derived.wdl?.draws);
    const totalLosses = sumOf((performance) => performance.derived.wdl?.losses);
    const totalWdlGames = totalWins + totalDraws + totalLosses;

    return {
      matches: averageOf((performance) => performance.raw.nbMatches),
      minutes: averageOf((performance) => performance.derived.minutes),
      rating: averageOf((performance) => performance.derived.avgRatingPerGame),
      goals: averageOf((performance) => performance.raw.goals),
      assists: averageOf((performance) => performance.raw.assists),
      xG: averageOf((performance) => performance.raw.xG),
      shots: averageOf((performance) => performance.raw.shots),
      sotPct: totalShots > 0 ? (totalShotsOnTarget / totalShots) * 100 : null,
      passPct: totalPasses > 0 ? (totalPassesAccurate / totalPasses) * 100 : null,
      chances: averageOf((performance) => performance.raw.chancesCreated),
      defActions: averageOf((performance) => performance.derived.defensiveActions),
      wdl: {
        wins: averageOf((performance) => performance.derived.wdl?.wins),
        draws: averageOf((performance) => performance.derived.wdl?.draws),
        losses: averageOf((performance) => performance.derived.wdl?.losses),
        winPct: totalWdlGames > 0 ? (totalWins / totalWdlGames) * 100 : null,
      },
    };
  };

  const formatAveragesWdl = (wdlSummary) => {
    if (!wdlSummary) {
      return 'N/A';
    }
    const wins = formatNumber(wdlSummary.wins, 1);
    const draws = formatNumber(wdlSummary.draws, 1);
    const losses = formatNumber(wdlSummary.losses, 1);
    const winPct = formatPercent(wdlSummary.winPct);
    return `${wins}-${draws}-${losses} (${winPct})`;
  };

  return (
    <div className="table-scroll-wrapper">
      <table className="performance-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('id')} className="sortable">Player ID {getSortIcon('id')}</th>
            <th onClick={() => handleSort('name')} className="sortable">Name {getSortIcon('name')}</th>
            <th onClick={() => handleSort('primaryPosition')} className="sortable">Primary Pos {getSortIcon('primaryPosition')}</th>
            <th onClick={() => handleSort('matches')} className="sortable">Matches {getSortIcon('matches')}</th>
            <th onClick={() => handleSort('minutes')} className="sortable">Minutes {getSortIcon('minutes')}</th>
            <th onClick={() => handleSort('rating')} className="sortable">Rating {getSortIcon('rating')}</th>
            <th onClick={() => handleSort('goals')} className="sortable">Goals {getSortIcon('goals')}</th>
            <th onClick={() => handleSort('assists')} className="sortable">Assists {getSortIcon('assists')}</th>
            <th onClick={() => handleSort('xG')} className="sortable">xG {getSortIcon('xG')}</th>
            <th onClick={() => handleSort('shots')} className="sortable">Shots {getSortIcon('shots')}</th>
            <th onClick={() => handleSort('sotPct')} className="sortable">SOT% {getSortIcon('sotPct')}</th>
            <th onClick={() => handleSort('passPct')} className="sortable">Pass% {getSortIcon('passPct')}</th>
            <th onClick={() => handleSort('chances')} className="sortable">Chances {getSortIcon('chances')}</th>
            <th onClick={() => handleSort('defActions')} className="sortable">Def Actions {getSortIcon('defActions')}</th>
            <th onClick={() => handleSort('wdl')} className="sortable">W-D-L {getSortIcon('wdl')}</th>
          </tr>
        </thead>
        <tbody>
          {POSITION_GROUP_ORDER.map((groupName) => {
            const playersInGroup = groupedPlayers[groupName];
            if (!playersInGroup.length) {
              return null;
            }
            const sectionAverages = getSectionAverages(playersInGroup);

            return (
              <React.Fragment key={groupName}>
                <tr className="performance-section-row">
                  <td colSpan={15}>{groupName}</td>
                </tr>
                <tr className="performance-section-averages-row" data-testid="performance-section-averages-row">
                  <td>Average</td>
                  <td>-</td>
                  <td>-</td>
                  <td>{sectionAverages ? formatNumber(sectionAverages.matches, 1) : 'N/A'}</td>
                  <td>{sectionAverages ? formatNumber(sectionAverages.minutes, 1) : 'N/A'}</td>
                  <td>{sectionAverages ? formatNumber(sectionAverages.rating, 2) : 'N/A'}</td>
                  <td>{sectionAverages ? formatNumber(sectionAverages.goals, 1) : 'N/A'}</td>
                  <td>{sectionAverages ? formatNumber(sectionAverages.assists, 1) : 'N/A'}</td>
                  <td>{sectionAverages ? formatNumber(sectionAverages.xG, 2) : 'N/A'}</td>
                  <td>{sectionAverages ? formatNumber(sectionAverages.shots, 1) : 'N/A'}</td>
                  <td>{sectionAverages ? formatPercent(sectionAverages.sotPct) : 'N/A'}</td>
                  <td>{sectionAverages ? formatPercent(sectionAverages.passPct) : 'N/A'}</td>
                  <td>{sectionAverages ? formatNumber(sectionAverages.chances, 1) : 'N/A'}</td>
                  <td>{sectionAverages ? formatNumber(sectionAverages.defActions, 1) : 'N/A'}</td>
                  <td>{sectionAverages ? formatAveragesWdl(sectionAverages.wdl) : 'N/A'}</td>
                </tr>
                {playersInGroup.map((player) => {
                  const performance = getPerformance(player);
                  const ratingColors = getStatColors(performance.hasData ? performance.derived.avgRatingPerGame : 'N/A');
                  return (
                    <tr key={player.id} data-testid="performance-row">
                      <td>
                        <a href={`https://mflplayer.info/player/${player.id}`} target="_blank" rel="noopener noreferrer">
                          {player.id}
                        </a>
                      </td>
                      <td>{player.name}</td>
                      <td>{player.primaryPositionWithRating?.[0]?.position || 'N/A'}</td>
                      <td>{performance.hasData ? formatNumber(performance.raw.nbMatches, 0) : 'N/A'}</td>
                      <td>{performance.hasData ? formatNumber(performance.derived.minutes, 0) : 'N/A'}</td>
                      <td>
                        <span
                          className="stat-badge"
                          style={{
                            color: ratingColors.textColor,
                            backgroundColor: ratingColors.backgroundColor,
                            fontWeight: 'bold',
                          }}
                        >
                          {performance.hasData ? formatNumber(performance.derived.avgRatingPerGame, 2) : 'N/A'}
                        </span>
                      </td>
                      <td>{performance.hasData ? formatNumber(performance.raw.goals, 0) : 'N/A'}</td>
                      <td>{performance.hasData ? formatNumber(performance.raw.assists, 0) : 'N/A'}</td>
                      <td>{performance.hasData ? formatNumber(performance.raw.xG, 2) : 'N/A'}</td>
                      <td>{performance.hasData ? formatNumber(performance.raw.shots, 0) : 'N/A'}</td>
                      <td>{performance.hasData ? formatPercent(performance.derived.shotOnTargetPct) : 'N/A'}</td>
                      <td>{performance.hasData ? formatPercent(performance.derived.passAccuracyPct) : 'N/A'}</td>
                      <td>{performance.hasData ? formatNumber(performance.raw.chancesCreated, 0) : 'N/A'}</td>
                      <td>{performance.hasData ? formatNumber(performance.derived.defensiveActions, 0) : 'N/A'}</td>
                      <td>{formatWdl(performance.derived.wdl, performance.hasData)}</td>
                    </tr>
                  );
                })}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PlayerPerformanceView;
