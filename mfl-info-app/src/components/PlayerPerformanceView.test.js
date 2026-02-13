import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import PlayerPerformanceView from './PlayerPerformanceView';

const players = [
  {
    id: '201',
    name: 'A. High',
    primaryPositionWithRating: [{ position: 'FW', rating: 90 }],
    performance: {
      hasData: true,
      raw: {
        nbMatches: 10,
        rating: 95.2,
        goals: 8,
        assists: 2,
        xG: 6.3,
        shots: 24,
        chancesCreated: 7,
      },
      derived: {
        minutes: 900,
        avgRatingPerGame: 9.52,
        shotOnTargetPct: 54.1,
        passAccuracyPct: 81.4,
        defensiveActions: 9,
        wdl: { wins: 7, draws: 1, losses: 2 },
      },
    },
  },
  {
    id: '202',
    name: 'B. Mid',
    primaryPositionWithRating: [{ position: 'CM', rating: 82 }],
    performance: {
      hasData: true,
      raw: {
        nbMatches: 12,
        rating: 84.9,
        goals: 3,
        assists: 2,
        xG: 2.2,
        shots: 10,
        shotsOnTarget: 4,
        chancesCreated: 8,
        passes: 100,
        passesAccurate: 90,
      },
      derived: {
        minutes: 1020,
        avgRatingPerGame: 7.08,
        shotOnTargetPct: 40.0,
        passAccuracyPct: 90.0,
        defensiveActions: 23,
        wdl: { wins: 3, draws: 1, losses: 0 },
      },
    },
  },
  {
    id: '203',
    name: 'C. MidTie',
    primaryPositionWithRating: [{ position: 'CM', rating: 80 }],
    performance: {
      hasData: true,
      raw: {
        nbMatches: 12,
        rating: 81.4,
        goals: 1,
        assists: 1,
        xG: 1.1,
        shots: 8,
        shotsOnTarget: 1,
        chancesCreated: 4,
        passes: 80,
        passesAccurate: 60,
      },
      derived: {
        minutes: 980,
        avgRatingPerGame: 6.78,
        shotOnTargetPct: 12.5,
        passAccuracyPct: 75.0,
        defensiveActions: 27,
        wdl: { wins: 3, draws: 1, losses: 0 },
      },
    },
  },
  {
    id: '204',
    name: 'D. NoData',
    primaryPositionWithRating: [{ position: 'CB', rating: 76 }],
    performance: {
      hasData: false,
      raw: {},
      derived: { wdl: { wins: null, draws: null, losses: null } },
    },
  },
  {
    id: '205',
    name: 'E. Zero',
    primaryPositionWithRating: [{ position: 'GK', rating: 74 }],
    performance: {
      hasData: true,
      raw: {
        nbMatches: 0,
        rating: 0,
        goals: 0,
        assists: 0,
        xG: 0,
        shots: 0,
        chancesCreated: 0,
      },
      derived: {
        minutes: 0,
        avgRatingPerGame: null,
        shotOnTargetPct: null,
        passAccuracyPct: null,
        defensiveActions: 0,
        wdl: { wins: 0, draws: 0, losses: 0 },
      },
    },
  },
];

const getRenderedRows = () => screen.getAllByTestId('performance-row');

describe('PlayerPerformanceView', () => {
  test('renders all configured columns', () => {
    render(<PlayerPerformanceView players={players} />);

    const headers = [
      'Player ID',
      'Name',
      'Primary Pos',
      'Matches',
      'Minutes',
      'Rating',
      'Goals',
      'Assists',
      'xG',
      'Shots',
      'SOT%',
      'Pass%',
      'Chances',
      'Def Actions',
      'W-D-L',
    ];

    headers.forEach((header) => {
      expect(screen.getByRole('columnheader', { name: new RegExp(header, 'i') })).toBeInTheDocument();
    });
  });

  test('does not render players with no played matches', () => {
    render(<PlayerPerformanceView players={players} />);
    expect(screen.queryByRole('row', { name: /204.*D\. NoData/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('row', { name: /205.*E\. Zero/i })).not.toBeInTheDocument();
  });

  test('sorts by Rating desc by default', () => {
    render(<PlayerPerformanceView players={players} />);
    const firstRow = getRenderedRows()[0];
    expect(within(firstRow).getByText('A. High')).toBeInTheDocument();
  });

  test('sorts by W-D-L win percentage and goal contributions tiebreaker', () => {
    render(<PlayerPerformanceView players={players} />);
    const wdlHeader = screen.getByRole('columnheader', { name: /W-D-L/i });

    fireEvent.click(wdlHeader);
    fireEvent.click(wdlHeader);

    const rows = getRenderedRows();
    expect(within(rows[0]).getByText('A. High')).toBeInTheDocument();
    expect(within(rows[1]).getByText('B. Mid')).toBeInTheDocument();
    expect(within(rows[2]).getByText('C. MidTie')).toBeInTheDocument();
    expect(rows).toHaveLength(3);
  });

  test('renders performance sections by position group', () => {
    render(<PlayerPerformanceView players={players} />);

    expect(screen.getByText(/Attackers/)).toBeInTheDocument();
    expect(screen.getByText(/Midfielders/)).toBeInTheDocument();
    expect(screen.queryByText(/Defenders/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Goalkeepers/)).not.toBeInTheDocument();
    expect(screen.getAllByTestId('performance-section-averages-row')).toHaveLength(2);
  });

  test('shows section averages and computes percent stats from underlying totals', () => {
    render(<PlayerPerformanceView players={players} />);

    const avgRows = screen.getAllByTestId('performance-section-averages-row');
    const midfieldAveragesRow = avgRows[1];

    expect(within(midfieldAveragesRow).getByText('6.93')).toBeInTheDocument();
    expect(within(midfieldAveragesRow).getByText('27.8%')).toBeInTheDocument();
    expect(within(midfieldAveragesRow).getByText('83.3%')).toBeInTheDocument();
  });

  test('shows W-D-L with win percentage', () => {
    render(<PlayerPerformanceView players={players} />);
    const row = screen.getByRole('row', { name: /201.*A\. High/i });
    expect(within(row).getByText('7-1-2 (70.0%)')).toBeInTheDocument();
  });
});
