import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';
import '@testing-library/jest-dom';

describe('App Component', () => {
  const mockPlayersResponse = [
    {
      id: '1001',
      metadata: {
        firstName: 'Test',
        lastName: 'Player',
        positions: ['CM'],
        overall: 75,
        age: 25,
        pace: 70,
        dribbling: 72,
        passing: 76,
        shooting: 68,
        defense: 74,
        physical: 73,
        goalkeeping: 20,
      },
      stats: {
        nbMatches: 3,
        time: 16200,
        goals: 1,
        shots: 3,
        shotsOnTarget: 2,
        shotsIntercepted: 0,
        dribblingSuccess: 4,
        assists: 1,
        yellowCards: 0,
        redCards: 0,
        saves: 0,
        goalsConceded: 0,
        wins: 2,
        draws: 1,
        losses: 0,
        foulsCommitted: 1,
        foulsSuffered: 2,
        rating: 78.32,
        xG: 0.82,
        chancesCreated: 3,
        passes: 110,
        passesAccurate: 99,
        crosses: 2,
        crossesAccurate: 1,
        shotsInterceptions: 1,
        clearances: 6,
        dribbledPast: 2,
        ownGoals: 0,
        defensiveDuelsWon: 4,
        v: 6,
      },
    },
  ];

  beforeEach(() => {
    jest.spyOn(global, 'fetch').mockImplementation((url) => {
      if (url === 'https://z519wdyajg.execute-api.us-east-1.amazonaws.com/prod/clubs/2715') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ name: 'Test FC' }),
        });
      }

      if (url === 'https://z519wdyajg.execute-api.us-east-1.amazonaws.com/prod/clubs/2715/players') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockPlayersResponse),
        });
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders heading and fetches club + players after searching a club id', async () => {
    render(<App />);
    expect(screen.getByText(/MFL Club Overview/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Club ID/i), { target: { value: '2715' } });
    fireEvent.click(screen.getByRole('button', { name: /Search/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('https://z519wdyajg.execute-api.us-east-1.amazonaws.com/prod/clubs/2715');
      expect(global.fetch).toHaveBeenCalledWith('https://z519wdyajg.execute-api.us-east-1.amazonaws.com/prod/clubs/2715/players');
    });

    expect(await screen.findByText('Test FC')).toBeInTheDocument();
    expect(await screen.findByText(/T\. Player/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Player Performance' })).toBeInTheDocument();
  });
});
