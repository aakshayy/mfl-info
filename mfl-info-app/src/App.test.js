import { render, screen } from '@testing-library/react';
import App from './App';
import '@testing-library/jest-dom'; // For .toBeInTheDocument()

// Mock the fetch function globally for tests in this file,
// as App component renders PlayersTable which fetches data.
describe('App Component', () => {
  let mockFetch;

  beforeEach(() => {
    // Clear any previous fetch mocks
    if (mockFetch) {
      mockFetch.mockRestore();
    }
    mockFetch = jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          items: [{ id: "contract1", player: "p1", club: "c1" }],
          resources: {
            players: { p1: { metadata: { firstName: "Test", lastName: "Player", positions: ["GK"], overall: 70, age: 30, nationalities: ["ANY"] } } },
            clubs: { c1: { name: "Any Club" } },
          },
        }),
      })
    );
  });

  afterEach(() => {
    // Restore fetch to its original implementation
    mockFetch.mockRestore();
  });

  test('renders MFL Players heading and eventually the players table', async () => {
    render(<App />);
    const headingElement = screen.getByText(/MFL Players/i);
    expect(headingElement).toBeInTheDocument();

    // Check if the table is rendered by waiting for one of its specific headers
    const tableHeaderElement = await screen.findByText(/Overall/i); 
    expect(tableHeaderElement).toBeInTheDocument();

    // Also check for some data to ensure the mock was effective
    const playerNameElement = await screen.findByText(/Test Player/i);
    expect(playerNameElement).toBeInTheDocument();
  });
});
