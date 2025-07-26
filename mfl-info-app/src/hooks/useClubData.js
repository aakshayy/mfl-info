import { useState } from 'react';
import { fetchClubInfo, fetchClubPlayers } from '../services/api';
import { transformPlayers } from '../utils/positionCalculations';

/**
 * Custom hook for managing club data (info and players)
 * @returns {Object} Hook state and methods
 */
export function useClubData() {
  // Club info state
  const [clubName, setClubName] = useState('');
  const [clubLoading, setClubLoading] = useState(false);
  const [clubError, setClubError] = useState(null);

  // Players state
  const [players, setPlayers] = useState([]);
  const [playersLoading, setPlayersLoading] = useState(false);
  const [playersError, setPlayersError] = useState(null);

  // Form state
  const [clubId, setClubId] = useState(null);

  /**
   * Fetch club information
   * @param {string|number} clubIdToFetch - Club ID to fetch
   */
  const loadClubInfo = async (clubIdToFetch) => {
    if (!clubIdToFetch) return;

    setClubLoading(true);
    setClubError(null);

    try {
      const data = await fetchClubInfo(clubIdToFetch);
      if (data && data.name) {
        setClubName(data.name);
      }
    } catch (error) {
      setClubError(error);
      setClubName('');
    } finally {
      setClubLoading(false);
    }
  };

  /**
   * Fetch club players
   * @param {string|number} clubIdToFetch - Club ID to fetch players for
   */
  const loadClubPlayers = async (clubIdToFetch) => {
    if (!clubIdToFetch) return;

    setPlayersLoading(true);
    setPlayersError(null);

    try {
      const data = await fetchClubPlayers(clubIdToFetch);
      if (Array.isArray(data)) {
        const transformedPlayers = transformPlayers(data);
        setPlayers(transformedPlayers);
      } else {
        console.warn("Fetched data structure is not as expected:", data);
        setPlayers([]);
      }
    } catch (error) {
      setPlayersError(error);
      setPlayers([]);
    } finally {
      setPlayersLoading(false);
    }
  };

  /**
   * Load both club info and players
   * @param {string|number} clubIdToFetch - Club ID to fetch
   */
  const loadClubData = async (clubIdToFetch) => {
    if (!clubIdToFetch) return;
    
    // Load both club info and players concurrently
    await Promise.all([
      loadClubInfo(clubIdToFetch),
      loadClubPlayers(clubIdToFetch)
    ]);
  };

  return {
    // State
    clubName,
    clubLoading,
    clubError,
    players,
    playersLoading,
    playersError,
    clubId,
    
    // Actions
    setClubId,
    loadClubData,
    loadClubInfo,
    loadClubPlayers,
    
    // Computed values
    loading: clubLoading || playersLoading,
    error: clubError || playersError,
  };
}