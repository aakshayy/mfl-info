const API_HOSTNAME = 'https://z519wdyajg.execute-api.us-east-1.amazonaws.com';

/**
 * Generic API call handler with error handling
 * @param {string} endpoint - API endpoint to call
 * @returns {Promise<Object>} API response data
 */
async function apiCall(endpoint) {
  const response = await fetch(`${API_HOSTNAME}${endpoint}`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

/**
 * Fetch club information by club ID
 * @param {string|number} clubId - Club ID to fetch
 * @returns {Promise<Object>} Club information object
 */
export async function fetchClubInfo(clubId) {
  if (!clubId) {
    throw new Error('Club ID is required');
  }
  return await apiCall(`/prod/clubs/${clubId}`);
}

/**
 * Fetch players for a specific club
 * @param {string|number} clubId - Club ID to fetch players for
 * @returns {Promise<Array>} Array of player objects
 */
export async function fetchClubPlayers(clubId) {
  if (!clubId) {
    throw new Error('Club ID is required');
  }
  return await apiCall(`/prod/clubs/${clubId}/players`);
}