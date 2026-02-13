import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PlayersTable from './PlayersTable';
import { transformPlayers } from './utils/positionCalculations';

const rawPlayers = [
  {
    id: '101',
    metadata: {
      firstName: 'Alpha',
      lastName: 'One',
      positions: ['FW', 'AM'],
      overall: 84,
      age: 24,
      pace: 87,
      dribbling: 83,
      passing: 79,
      shooting: 85,
      defense: 44,
      physical: 71,
      goalkeeping: 12,
    },
    stats: {
      nbMatches: 10,
      time: 54000,
      goals: 9,
      shots: 21,
      shotsOnTarget: 12,
      shotsIntercepted: 2,
      dribblingSuccess: 20,
      assists: 4,
      yellowCards: 1,
      redCards: 0,
      saves: 0,
      goalsConceded: 0,
      wins: 7,
      draws: 2,
      losses: 1,
      foulsCommitted: 5,
      foulsSuffered: 10,
      rating: 124.25,
      xG: 7.91,
      chancesCreated: 11,
      passes: 210,
      passesAccurate: 173,
      crosses: 8,
      crossesAccurate: 4,
      shotsInterceptions: 1,
      clearances: 4,
      dribbledPast: 8,
      ownGoals: 0,
      defensiveDuelsWon: 7,
      v: 6,
    },
  },
  {
    id: '102',
    metadata: {
      firstName: 'Beta',
      lastName: 'Missing',
      positions: ['CB'],
      overall: 76,
      age: 30,
      pace: 62,
      dribbling: 60,
      passing: 68,
      shooting: 50,
      defense: 82,
      physical: 84,
      goalkeeping: 10,
    },
    stats: null,
  },
];

const transformedPlayers = transformPlayers(rawPlayers);

function createClubData(overrides = {}) {
  return {
    clubName: 'Fixture FC',
    clubLoading: false,
    clubError: null,
    clubLogoUrl: '',
    clubLogoLoaded: false,
    clubLogoError: false,
    players: transformedPlayers,
    playersLoading: false,
    playersError: null,
    setClubLogoLoaded: jest.fn(),
    setClubLogoError: jest.fn(),
    ...overrides,
  };
}

describe('PlayersTable', () => {
  test('renders loading and error states from clubData props', () => {
    const clubData = createClubData({
      playersLoading: true,
      playersError: new Error('boom'),
      players: [],
    });

    render(<PlayersTable clubData={clubData} />);

    expect(screen.getByText('Loading players...')).toBeInTheDocument();
    expect(screen.getByText('Error fetching players: boom')).toBeInTheDocument();
  });

  test('renders tabs including Player Performance and switches views', () => {
    render(<PlayersTable clubData={createClubData()} />);

    expect(screen.getByRole('button', { name: 'Players' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tactics' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Player Performance' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Player Performance' }));

    expect(screen.getByRole('columnheader', { name: /Matches/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /W-D-L/i })).toBeInTheDocument();
  });

  test('hides players with no played matches in Player Performance', () => {
    render(<PlayersTable clubData={createClubData()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Player Performance' }));

    expect(screen.queryByRole('row', { name: /102.*B\. Missing/i })).not.toBeInTheDocument();
  });
});
