import React, { useState } from 'react';
import './PlayersTable.css';
import ClubHeader from './components/ClubHeader';
import PlayersTableView from './components/PlayersTableView';
import TacticsView from './components/TacticsView';
import PlayerPerformanceView from './components/PlayerPerformanceView';
import StatsOverview from './components/StatsOverview';

const PlayersTable = ({ clubData }) => {
  const {
    clubName,
    clubLoading,
    clubError,
    clubLogoUrl,
    clubLogoLoaded,
    clubLogoError,
    players,
    playersLoading,
    playersError,
    setClubLogoLoaded,
    setClubLogoError
  } = clubData;

  const [activeTab, setActiveTab] = useState('players');
  const tabs = [
    { key: 'players', label: 'Players', render: () => <PlayersTableView players={players} /> },
    { key: 'tactics', label: 'Tactics', render: () => <TacticsView players={players} /> },
    { key: 'performance', label: 'Player Performance', render: () => <PlayerPerformanceView players={players} /> },
  ];
  const activeTabConfig = tabs.find((tab) => tab.key === activeTab);

  return (
    <div className="players-table-container">
      {/* Club header with name and logo */}
      <ClubHeader 
        clubName={clubName}
        clubLogoUrl={clubLogoUrl}
        clubLogoLoaded={clubLogoLoaded}
        clubLogoError={clubLogoError}
        onLogoLoad={setClubLogoLoaded}
        onLogoError={setClubLogoError}
        loading={clubLoading}
        error={clubError}
      />

      {/* Loading and error states */}
      {playersLoading && <div className="loading">Loading players...</div>}
      {playersError && <div className="error">Error fetching players: {playersError.message}</div>}

      {/* Stats overview */}
      <StatsOverview players={players} />

      {/* Tabs */}
      {players.length > 0 && (
        <div className="tab-header">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`tab-btn${activeTab === tab.key ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Tab content */}
      {players.length > 0 && (
        <div className="tab-content">
          {activeTabConfig && activeTabConfig.render()}
        </div>
      )}
    </div>
  );
};

export default PlayersTable;
