import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // For .toBeInTheDocument()
import PlayersTable from './PlayersTable';

// Mock API response data
const mockApiResponse = {
  items: [
    { id: "contract1", player: "p1", club: "c1" },
    { id: "contract2", player: "p2", club: "c2" },
  ],
  resources: {
    players: {
      p1: { metadata: { firstName: "Lionel", lastName: "Messi", positions: ["FW", "AM"], overall: 93, age: 36, nationalities: ["ARG"] } },
      p2: { metadata: { firstName: "Cristiano", lastName: "Ronaldo", positions: ["FW"], overall: 90, age: 38, nationalities: ["POR"] } },
    },
    clubs: {
      c1: { name: "Inter Miami CF" },
      c2: { name: "Al Nassr FC" },
    },
  },
};

describe('PlayersTable Component - API Integration', () => {
  let mockFetch;

  beforeEach(() => {
    // Clear any previous fetch mocks
    if (mockFetch) {
      mockFetch.mockRestore();
    }
    // Setup fetch mock
    mockFetch = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    // Restore fetch to its original implementation
    mockFetch.mockRestore();
  });

  test('displays loading state initially', async () => {
    // Mock fetch to return a promise that never resolves for this test
    mockFetch.mockImplementation(() => new Promise(() => {}));
    
    render(<PlayersTable />);
    expect(screen.getByText('Loading players...')).toBeInTheDocument();
  });

  test('displays error state on API fetch failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('API Error'));
    
    render(<PlayersTable />);
    
    // Wait for the error message to appear
    const errorMessage = await screen.findByText(/Error fetching players: API Error/i);
    expect(errorMessage).toBeInTheDocument();
  });

  test('fetches and displays player data successfully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });
    
    render(<PlayersTable />);

    // Wait for player data to be displayed
    // Check for player 1 details
    expect(await screen.findByText('Lionel Messi')).toBeInTheDocument();
    expect(screen.getByText('FW, AM')).toBeInTheDocument(); // Messi's positions
    expect(screen.getByText('93')).toBeInTheDocument();    // Messi's overall
    expect(screen.getByText('36')).toBeInTheDocument();    // Messi's age
    expect(screen.getByText('ARG')).toBeInTheDocument();   // Messi's nationality
    expect(screen.getByText('Inter Miami CF')).toBeInTheDocument(); // Messi's club

    // Check for player 2 details
    expect(await screen.findByText('Cristiano Ronaldo')).toBeInTheDocument();
    expect(screen.getByText('FW')).toBeInTheDocument();      // Ronaldo's positions (only one)
    expect(screen.getByText('90')).toBeInTheDocument();      // Ronaldo's overall
    expect(screen.getByText('38')).toBeInTheDocument();      // Ronaldo's age
    expect(screen.getByText('POR')).toBeInTheDocument();     // Ronaldo's nationality
    expect(screen.getByText('Al Nassr FC')).toBeInTheDocument(); // Ronaldo's club

    // Check table headers are still present
    expect(screen.getByText('Player ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Position')).toBeInTheDocument();
    expect(screen.getByText('Overall')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
    expect(screen.getByText('Nationality')).toBeInTheDocument();
    expect(screen.getByText('Club')).toBeInTheDocument();
  });

  test('handles unexpected API response structure gracefully', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: "This is not the expected data structure" }), // Incorrect structure
    });

    render(<PlayersTable />);

    // Expect an error message related to data format
    // The component throws "Data format from API is not as expected."
    const errorMessage = await screen.findByText(/Error fetching players: Data format from API is not as expected./i);
    expect(errorMessage).toBeInTheDocument();
  });
  
  test('handles missing player or club details in API response', async () => {
    const incompleteApiResponse = {
      items: [{ id: "contract1", player: "p1", club: "c1" }],
      resources: {
        players: { /* p1 details missing */ },
        clubs: { c1: { name: "Test Club FC" } },
      },
    };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(incompleteApiResponse),
    });

    render(<PlayersTable />);
    // The component logs a warning and filters out such players.
    // It should then display an empty table (or just headers) without crashing.
    // Or, if it throws an error that bubbles up to the error state, test for that.
    // Based on current PlayersTable.js, it throws "Data format from API is not as expected."
    // if resources.players itself is missing. If only a specific player is missing, it filters.
    // Let's adjust for the "Data format" error as it's more likely for a malformed resources block.
    // If the `items` array refers to a player ID not in `resources.players`, the `playerDetails`
    // would be undefined. The `filter(player => player !== null)` handles this by removing them.
    // So, the table would be empty or show fewer players. Here, with one item and missing details,
    // the table should render headers but no data rows.

    // Wait for the table to render (it might briefly show loading)
    await screen.findByRole('table'); // Ensure table structure is there

    // Check that no player names are rendered from this incomplete data
    expect(screen.queryByText("Lionel Messi")).not.toBeInTheDocument();
    expect(screen.queryByText("Test Club FC")).not.toBeInTheDocument(); // Club name should not appear if player is filtered
    
    // Headers should still be there
    expect(screen.getByText('Player ID')).toBeInTheDocument();
  });
});
