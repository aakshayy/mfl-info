import React, { useState, useEffect } from 'react';
import './PlayersTable.css';
import { useClubData } from './hooks/useClubData';
import ClubForm from './components/ClubForm';
import PlayersTableView from './components/PlayersTableView';
import TacticsView from './components/TacticsView';
import StatsOverview from './components/StatsOverview';

const PlayersTable = () => {
  const {
    clubName,
    clubLoading,
    clubError,
    players,
    playersLoading,
    playersError,
    clubId,
    setClubId,
    loadClubData,
    loading
  } = useClubData();

  const [activeTab, setActiveTab] = useState('players');

  useEffect(() => {
    if (clubId) {
      loadClubData(clubId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = () => {
    if (clubId) {
      loadClubData(clubId);
    }
  };

  return (
    <div className="players-table-container">
      {/* Club name display */}
      {clubLoading && <h2>Loading club information...</h2>}
      {clubError && <h2 style={{color: 'red'}}>Error loading club: {clubError.message}</h2>}
      {clubName && !clubLoading && !clubError && <h2>{clubName}</h2>}

      {/* Club form */}
      <ClubForm 
        clubId={clubId}
        onClubIdChange={setClubId}
        onSubmit={handleSubmit}
        loading={loading}
      />

      {/* Loading and error states */}
      {playersLoading && <div className="loading">Loading players...</div>}
      {playersError && <div className="error">Error fetching players: {playersError.message}</div>}

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

      {/* Stats overview */}
      <StatsOverview players={players} />
    </div>
  );
};

export default PlayersTable;