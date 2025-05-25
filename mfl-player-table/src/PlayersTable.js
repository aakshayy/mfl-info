import React, { useState, useEffect } from 'react';
import './PlayersTable.css';

const PlayersTable = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch('https://z519wdyajg.execute-api.us-east-1.amazonaws.com/prod/contracts?period=nextSeason&clubId=3988&limit=26');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (data && data.items && data.resources && data.resources.players && data.resources.clubs) {
          const transformedPlayers = data.items.map(item => {
            const playerId = item.player;
            const clubId = item.club;
            const playerDetails = data.resources.players[playerId];
            const clubDetails = data.resources.clubs[clubId];

            // Handle cases where details might be missing, though ideally API data is consistent
            if (!playerDetails || !clubDetails) {
              console.warn(`Missing details for player ${playerId} or club ${clubId}`);
              return null; // Or some default object
            }
            
            const name = `${playerDetails.metadata.firstName || ''} ${playerDetails.metadata.lastName || ''}`.trim();
            const position = playerDetails.metadata.positions ? playerDetails.metadata.positions.join(', ') : 'N/A';
            const overall = playerDetails.metadata.overall || 'N/A';
            const age = playerDetails.metadata.age || 'N/A';
            const nationality = playerDetails.metadata.nationalities ? playerDetails.metadata.nationalities.join(', ') : 'N/A';
            const clubName = clubDetails.name || 'N/A';

            return {
              id: playerId,
              name,
              position,
              overall,
              age,
              nationality,
              clubName,
            };
          }).filter(player => player !== null); // Filter out any null entries if details were missing

          setPlayers(transformedPlayers);
        } else {
          console.warn("Fetched data structure is not as expected:", data);
          throw new Error("Data format from API is not as expected.");
        }
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  if (loading) {
    return <div>Loading players...</div>;
  }

  if (error) {
    return <div>Error fetching players: {error.message}</div>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Player ID</th>
          <th>Name</th>
          <th>Position</th>
          <th>Overall</th>
          <th>Age</th>
          <th>Nationality</th>
          <th>Club</th>
        </tr>
      </thead>
      <tbody>
        {players.map(player => (
          <tr key={player.id}>
            <td>{player.id}</td>
            <td>{player.name}</td>
            <td>{player.position}</td>
            <td>{player.overall}</td>
            <td>{player.age}</td>
            <td>{player.nationality}</td>
            <td>{player.clubName}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PlayersTable;
