import { positionAttributeWeights, familiarityPenalty } from '../constants/positions';

/**
 * Calculate position rating for a player and position, given their primary position
 * @param {Object} player - Player object with attributes
 * @param {string} primaryPosition - Player's primary position
 * @param {string} targetPosition - Position to calculate rating for
 * @param {boolean} isSecondary - Whether this is a secondary position
 * @returns {number|null} Calculated position rating
 */
export function calculatePositionRating(player, primaryPosition, targetPosition, isSecondary = false) {
  const weights = positionAttributeWeights[targetPosition];
  if (!weights) return null;
  
  let rating = 0;
  for (const [attr, weight] of Object.entries(weights)) {
    if (typeof player[attr] === 'number' || (!isNaN(Number(player[attr])) && player[attr] !== 'N/A')) {
      rating += Number(player[attr]) * weight;
    }
  }
  
  let penalty = 0;
  if (primaryPosition !== targetPosition) {
    if (isSecondary) {
      penalty = -1;
    } else {
      // Get penalty from familiarity matrix
      penalty = -1 * (familiarityPenalty[primaryPosition]?.[targetPosition]);
    }
  }
  
  return Math.round(rating + penalty);
}

/**
 * Get other positions that the player is familiar with
 * @param {Object} player - Player object with attributes
 * @param {string} primaryPosition - Player's primary position
 * @param {Array} secondaryPositions - Player's secondary positions
 * @returns {Array} Array of {position, rating} objects
 */
export function getOtherPositionsWithRating(player, primaryPosition, secondaryPositions) {
  const positions = Object.keys(positionAttributeWeights);
  const otherPositions = positions.filter(pos => pos !== primaryPosition && !secondaryPositions.includes(pos));
  
  return otherPositions.map(pos => {
    const rating = calculatePositionRating(player, primaryPosition, pos, false);
    return { position: pos, rating: rating };
  });
}

/**
 * Transform raw player data into structured format with position ratings
 * @param {Array} rawPlayers - Raw player data from API
 * @returns {Array} Transformed player objects
 */
export function transformPlayers(rawPlayers) {
  return rawPlayers.map(player => {
    const meta = player.metadata || {};
    const positions = Array.isArray(meta.positions) ? meta.positions : [];
    const primaryPosition = positions[0];
    const primaryPositionWithRating = [{
      position: primaryPosition, 
      rating: calculatePositionRating(meta, primaryPosition, primaryPosition)
    }];
    
    const secondaryPositions = positions.length > 1 ? positions.slice(1) : [];
    const secondaryPositionsWithRatings = secondaryPositions.map(pos => {
      const rating = calculatePositionRating(meta, primaryPosition, pos.trim(), true);
      return { position: pos.trim(), rating: rating };
    });
    
    let otherPositionsWithRatings = getOtherPositionsWithRating(meta, primaryPosition, secondaryPositions);
    // Filter out any positions with a rating that is too low (5 less than overall)
    otherPositionsWithRatings = otherPositionsWithRatings.filter(p => p.rating > Number(meta.overall) - 5);
    
    const allRatings = [primaryPositionWithRating, secondaryPositionsWithRatings, otherPositionsWithRatings].flat();
    
    return {
      id: player.id,
      name: `${meta.firstName[0] || ''}. ${meta.lastName || ''}`.trim(),
      primaryPositionWithRating,
      secondaryPositionsWithRatings,
      otherPositionsWithRatings,
      allRatings,
      overall: meta.overall ?? 'N/A',
      age: meta.age ?? 'N/A',
      pace: meta.pace ?? 'N/A',
      dribbling: meta.dribbling ?? 'N/A',
      passing: meta.passing ?? 'N/A',
      shooting: meta.shooting ?? 'N/A',
      defense: meta.defense ?? 'N/A',
      physical: meta.physical ?? 'N/A',
      goalkeeping: meta.goalkeeping ?? 'N/A',
    };
  });
}