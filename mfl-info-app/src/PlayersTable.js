import React, { useState } from 'react';
import './PlayersTable.css';
import ClubHeader from './components/ClubHeader';
import PlayersTableView from './components/PlayersTableView';
import TacticsView from './components/TacticsView';
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
      )}

      {/* Tab content */}
      {players.length > 0 && (
        <div className="tab-content">
          {activeTab === 'players' && <PlayersTableView players={players} />}
          {activeTab === 'tactics' && <TacticsView players={players} />}
        </div>
      )}
    </div>
  );
};

export default PlayersTable;